import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMenu } from "@/models/menu.repo";
import { rowToCartLine } from "@/models/orderItem.map";
import type { OrderWithItems } from "@/models/order.types";
import { OrderBuilder } from "@/views/panel/OrderBuilder";

export default async function EditarPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/panel/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (!order) notFound();

  const typed = order as OrderWithItems;
  // Solo se corrige mientras está pendiente.
  if (typed.status !== "pendiente") redirect(`/panel/mesera/${id}`);

  const menu = await getMenu();
  const lines = (typed.order_items ?? []).map(rowToCartLine);

  return (
    <OrderBuilder
      menu={menu}
      mode="edit"
      orderId={typed.id}
      initial={{
        customerName: typed.customer_name,
        note: typed.note ?? "",
        lines,
      }}
    />
  );
}
