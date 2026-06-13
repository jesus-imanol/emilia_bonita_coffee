"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MENU } from "@/models/menu.data";
import { MENU_TAG } from "@/models/menu.repo";
import type { CartLine } from "@/models/cart.types";
import type { PaymentMethod } from "@/models/order.types";
import type { PriceVariant, ExtraAddOn } from "@/models/menu.types";
import { cartLineToInsert } from "@/models/orderItem.map";

/** Verifica que quien llama sea admin y devuelve el client (RLS aplica). */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Solo el administrador.");
  return supabase;
}

/** Siembra la carta del código (menu.data.ts) en Supabase. Idempotente. */
export async function seedMenu() {
  const supabase = await requireAdmin();

  for (const [ci, cat] of MENU.entries()) {
    const { data: catRow, error: ce } = await supabase
      .from("menu_categories")
      .upsert(
        {
          slug: cat.id,
          name: cat.name,
          tagline: cat.tagline ?? null,
          option_groups: cat.optionGroups ?? null,
          sort_order: ci,
          active: true,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (ce || !catRow) throw new Error(ce?.message ?? "Error al sembrar la categoría.");

    const rows = cat.items.map((item, ii) => ({
      slug: item.id,
      category_id: catRow.id,
      name: item.name,
      description: item.description ?? null,
      price: item.price ?? null,
      variants: item.variants ?? null,
      options: item.options ?? null,
      picks: item.picks ?? null,
      extra: item.extra ?? null,
      note: item.note ?? null,
      sort_order: ii,
      active: true,
    }));
    const { error: ie } = await supabase
      .from("menu_items")
      .upsert(rows, { onConflict: "slug" });
    if (ie) throw new Error(ie.message);
  }

  revalidateTag(MENU_TAG, { expire: 0 });
}

export interface SaveMenuItemInput {
  name: string;
  price: number | null;
  description: string | null;
  active: boolean;
  /** Campos avanzados: solo se actualizan si vienen definidos. */
  variants?: PriceVariant[] | null;
  options?: string[] | null;
  picks?: number | null;
  extra?: ExtraAddOn | null;
}

/** Edita un producto. Nombre/precio/disponibilidad siempre; lo avanzado si viene. */
export async function saveMenuItem(id: string, fields: SaveMenuItemInput) {
  const supabase = await requireAdmin();

  const update: Record<string, unknown> = {
    name: fields.name,
    price: fields.price,
    description: fields.description,
    active: fields.active,
  };
  if (fields.variants !== undefined) update.variants = fields.variants;
  if (fields.options !== undefined) update.options = fields.options;
  if (fields.picks !== undefined) update.picks = fields.picks;
  if (fields.extra !== undefined) update.extra = fields.extra;

  const { error } = await supabase.from("menu_items").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag(MENU_TAG, { expire: 0 });
}

/** Genera un slug estable y único a partir de un nombre. */
function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "item"}-${crypto.randomUUID().slice(0, 4)}`;
}

export interface CreateCategoryInput {
  name: string;
  tagline: string;
}

/** Crea una categoría nueva (al final de la carta). */
export async function createCategory(input: CreateCategoryInput) {
  const supabase = await requireAdmin();
  const name = input.name.trim();
  if (!name) throw new Error("Escribe el nombre de la categoría.");

  const { data: last } = await supabase
    .from("menu_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (last?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("menu_categories").insert({
    slug: slugify(name),
    name,
    tagline: input.tagline.trim() || null,
    sort_order,
    active: true,
  });
  if (error) throw new Error(error.message);
  revalidateTag(MENU_TAG, { expire: 0 });
}

export async function deleteCategory(id: string) {
  const supabase = await requireAdmin();
  // ON DELETE CASCADE borra también sus productos.
  const { error } = await supabase.from("menu_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag(MENU_TAG, { expire: 0 });
}

export interface CreateMenuItemInput {
  categoryId: string;
  name: string;
  description: string | null;
  /** Precio único (usar esto o `variants`). */
  price: number | null;
  /** Precios por tamaño. */
  variants: PriceVariant[] | null;
  /** Sabores elegibles. */
  options: string[] | null;
  /** Cuántos sabores elige el cliente (>=2 = selección múltiple). */
  picks: number | null;
  /** Complemento opcional con cargo. */
  extra: ExtraAddOn | null;
}

/** Crea un producto dentro de una categoría (precio único o por tamaños). */
export async function createMenuItem(input: CreateMenuItemInput) {
  const supabase = await requireAdmin();
  const name = input.name.trim();
  if (!name) throw new Error("Escribe el nombre del producto.");

  const hasVariants = Boolean(input.variants?.length);
  if (!hasVariants && (input.price == null || input.price < 0)) {
    throw new Error("Pon un precio o agrega al menos un tamaño.");
  }

  const { data: last } = await supabase
    .from("menu_items")
    .select("sort_order")
    .eq("category_id", input.categoryId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (last?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("menu_items").insert({
    slug: slugify(name),
    category_id: input.categoryId,
    name,
    description: input.description?.trim() || null,
    price: hasVariants ? null : input.price,
    variants: hasVariants ? input.variants : null,
    options: input.options?.length ? input.options : null,
    picks: input.options?.length && (input.picks ?? 0) >= 2 ? input.picks : null,
    extra: input.extra ?? null,
    sort_order,
    active: true,
  });
  if (error) throw new Error(error.message);
  revalidateTag(MENU_TAG, { expire: 0 });
}

export async function deleteMenuItem(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag(MENU_TAG, { expire: 0 });
}

/* ============================================================
   Pedidos (mesera / admin)
   El total SIEMPRE se recalcula en el servidor (Σ unit_price·qty);
   nunca confiamos en un total enviado por el cliente. RLS exige
   created_by = auth.uid() al insertar y status='pendiente' al editar.
   ============================================================ */

export interface OrderDraftInput {
  customerName: string;
  note: string;
  lines: CartLine[];
}

export async function createOrder(input: OrderDraftInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");

  const customer = input.customerName.trim();
  if (!customer) throw new Error("Escribe el nombre del cliente.");
  const lines = input.lines.filter((l) => l.qty >= 1);
  if (lines.length === 0) throw new Error("Agrega al menos un producto.");

  const subtotal = lines.reduce(
    (sum, l) => sum + Math.round(l.unitPrice) * l.qty,
    0
  );

  const { data: order, error: oe } = await supabase
    .from("orders")
    .insert({
      customer_name: customer,
      note: input.note.trim() || null,
      subtotal,
      total: subtotal,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (oe || !order) throw new Error(oe?.message ?? "No se pudo crear el pedido.");

  const rows = lines.map((l) => cartLineToInsert(l, order.id));
  const { error: ie } = await supabase.from("order_items").insert(rows);
  if (ie) {
    // No dejamos un pedido huérfano sin productos.
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(ie.message);
  }

  return { id: order.id as string };
}

export async function updateOrderItems(
  input: OrderDraftInput & { orderId: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");

  const customer = input.customerName.trim();
  if (!customer) throw new Error("Escribe el nombre del cliente.");
  const lines = input.lines.filter((l) => l.qty >= 1);
  if (lines.length === 0) throw new Error("Agrega al menos un producto.");

  const subtotal = lines.reduce(
    (sum, l) => sum + Math.round(l.unitPrice) * l.qty,
    0
  );

  // RLS bloquea esto si el pedido ya no está pendiente (cobrado/cancelado).
  const { error: de } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", input.orderId);
  if (de) throw new Error(de.message);

  const rows = lines.map((l) => cartLineToInsert(l, input.orderId));
  const { error: ie } = await supabase.from("order_items").insert(rows);
  if (ie) throw new Error(ie.message);

  const { error: ue } = await supabase
    .from("orders")
    .update({
      customer_name: customer,
      note: input.note.trim() || null,
      subtotal,
      total: subtotal,
    })
    .eq("id", input.orderId);
  if (ue) throw new Error(ue.message);

  return { id: input.orderId };
}

/** Cobra un pedido pendiente (admin o la mesera dueña). */
export async function cobrarOrder(orderId: string, method: PaymentMethod) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");
  if (method !== "efectivo" && method !== "transferencia") {
    throw new Error("Método de pago inválido.");
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "cobrado",
      payment_method: method,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "pendiente"); // no recobrar
  if (error) throw new Error(error.message);
}

/** Cancela un pedido pendiente. */
export async function cancelarOrder(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelado" })
    .eq("id", orderId)
    .eq("status", "pendiente");
  if (error) throw new Error(error.message);
}

/* ============================================================
   Cuentas de meseras (solo admin · service-role)
   ============================================================ */

export interface CreateMeseraInput {
  email: string;
  password: string;
  fullName: string;
}

export async function createMesera(input: CreateMeseraInput) {
  await requireAdmin(); // verifica que quien llama sea admin

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!email) throw new Error("Escribe el correo.");
  if (!fullName) throw new Error("Escribe el nombre.");
  if (input.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { role: "mesera", full_name: fullName },
  });
  if (error) throw new Error(error.message);
}
