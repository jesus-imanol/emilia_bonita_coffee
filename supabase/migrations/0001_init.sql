-- ============================================================
-- Emilia Bonita · Panel POS — esquema inicial
-- Correr en Supabase (SQL Editor) o con la CLI de Supabase.
-- Dinero SIEMPRE en enteros (pesos), nunca float.
-- ============================================================

-- ---- Extensiones ----
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ---- Enums ----
create type public.user_role      as enum ('admin', 'mesera');
create type public.order_status   as enum ('pendiente', 'cobrado', 'cancelado');
create type public.payment_method as enum ('efectivo', 'transferencia');

-- ============================================================
-- Helper updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. PROFILES (1:1 con auth.users, guarda el rol)
-- ============================================================
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       public.user_role not null default 'mesera',
  full_name  text not null default '',
  created_at timestamptz not null default now()
);

-- Crea el profile automáticamente al registrarse (rol desde user_metadata).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'mesera')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. CARTA: menu_categories + menu_items (fuente única)
-- ============================================================
create table public.menu_categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,          -- CategoryId, ej. 'hamburguesas'
  name          text not null,
  tagline       text,
  option_groups jsonb,                          -- crepas: [{label, options[]}]
  sort_order    int  not null default 0,
  active        boolean not null default true,
  updated_at    timestamptz not null default now()
);

create table public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,             -- id estable, ej. 'hamburguesa-clasica'
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name        text not null,
  description text,
  price       int,                              -- null si solo tiene variants
  variants    jsonb,                            -- PriceVariant[]: [{label, price}]
  options     text[],                           -- sabores
  picks       int,                              -- crepas: # de ingredientes
  extra       jsonb,                            -- ExtraAddOn: {label, price}
  note        text,
  sort_order  int  not null default 0,
  active      boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index menu_items_category_idx on public.menu_items (category_id);
create index menu_items_active_idx   on public.menu_items (active);

create trigger menu_categories_updated_at before update on public.menu_categories
  for each row execute function public.set_updated_at();
create trigger menu_items_updated_at before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. ORDERS
-- ============================================================
create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  status         public.order_status not null default 'pendiente',
  subtotal       int  not null default 0,       -- pesos enteros
  total          int  not null default 0,       -- pesos enteros
  note           text,
  payment_method public.payment_method,         -- null hasta cobrar
  created_by     uuid not null references public.profiles(id),
  created_at     timestamptz not null default now(),
  paid_at        timestamptz,                    -- null hasta cobrar
  updated_at     timestamptz not null default now()
);

create index orders_status_idx     on public.orders (status);
create index orders_paid_at_idx    on public.orders (paid_at);
create index orders_created_by_idx on public.orders (created_by);

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4. ORDER_ITEMS (espejo de CartLine)
-- ============================================================
create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  item_id       text not null,                  -- slug del menu_item (snapshot)
  category_id   text not null,
  name          text not null,
  unit_price    int  not null,
  qty           int  not null check (qty >= 1),
  variant_label text,
  flavor        text,
  ingredients   text[],
  extra         boolean,
  extra_label   text,
  note          text,
  line_total    int  not null
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ============================================================
-- 5. Helper is_admin()  (SECURITY DEFINER evita recursión de RLS)
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- 6. RLS
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items      enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;

-- ---- profiles ----
create policy profiles_select_self  on public.profiles for select using (id = auth.uid());
create policy profiles_select_admin on public.profiles for select using (public.is_admin());
-- (sin insert/update de cliente: lo hacen el trigger y la action con service-role)

-- ---- menu (lectura pública de lo activo; escritura solo admin) ----
create policy menu_categories_select_public on public.menu_categories
  for select using (active or public.is_admin());
create policy menu_categories_admin_all on public.menu_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy menu_items_select_public on public.menu_items
  for select using (active or public.is_admin());
create policy menu_items_admin_all on public.menu_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- orders ----
create policy orders_insert_own on public.orders
  for insert with check (created_by = auth.uid());
create policy orders_select_own on public.orders
  for select using (created_by = auth.uid() or public.is_admin());
-- la mesera edita/cobra sus pedidos solo mientras están pendientes
create policy orders_update_own_pendiente on public.orders
  for update using (created_by = auth.uid() and status = 'pendiente')
  with check (created_by = auth.uid());
create policy orders_update_admin on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- ---- order_items (siguen al pedido; edición solo si pendiente) ----
create policy order_items_select on public.order_items
  for select using (exists (
    select 1 from public.orders o where o.id = order_items.order_id
      and (o.created_by = auth.uid() or public.is_admin())));
create policy order_items_insert on public.order_items
  for insert with check (exists (
    select 1 from public.orders o where o.id = order_items.order_id
      and o.created_by = auth.uid() and o.status = 'pendiente'));
create policy order_items_update on public.order_items
  for update using (exists (
    select 1 from public.orders o where o.id = order_items.order_id
      and o.created_by = auth.uid() and o.status = 'pendiente'));
create policy order_items_delete on public.order_items
  for delete using (exists (
    select 1 from public.orders o where o.id = order_items.order_id
      and o.created_by = auth.uid() and o.status = 'pendiente'));

-- ============================================================
-- 7. Reporte de ventas (admin) — día/semana/mes se agrupan en el cliente
-- ============================================================
create or replace function public.ventas_resumen(desde date, hasta date)
returns table (
  dia            date,
  total          bigint,
  cantidad       bigint,
  total_efectivo bigint,
  total_transfer bigint
)
language sql security definer set search_path = public stable as $$
  select
    (o.paid_at at time zone 'America/Mexico_City')::date                       as dia,
    sum(o.total)::bigint                                                        as total,
    count(*)::bigint                                                           as cantidad,
    coalesce(sum(o.total) filter (where o.payment_method = 'efectivo'), 0)::bigint      as total_efectivo,
    coalesce(sum(o.total) filter (where o.payment_method = 'transferencia'), 0)::bigint as total_transfer
  from public.orders o
  where public.is_admin()
    and o.status = 'cobrado'
    and o.paid_at is not null
    and (o.paid_at at time zone 'America/Mexico_City')::date between desde and hasta
  group by 1
  order by 1;
$$;

-- ============================================================
-- 8. Realtime (el admin escucha cambios de pedidos)
-- ============================================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
