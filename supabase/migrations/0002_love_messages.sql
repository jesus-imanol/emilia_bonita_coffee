-- ============================================================
-- Mensajes diarios (privados). Solo el admin escribe; lectura de los activos.
-- ============================================================
create table public.love_messages (
  id         uuid primary key default gen_random_uuid(),
  body       text not null,
  active     boolean not null default true,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

alter table public.love_messages enable row level security;

-- Lectura de los activos (la mesera los lee); el admin ve todos.
create policy love_messages_select on public.love_messages
  for select using (active or public.is_admin());

-- Escritura solo admin (el filtro por correo es a nivel de la app/server action).
create policy love_messages_admin_all on public.love_messages
  for all using (public.is_admin()) with check (public.is_admin());
