import { getMenu } from "@/models/menu.repo";
import { OrderBuilder } from "@/views/panel/OrderBuilder";

export default async function NuevoPedidoPage() {
  const menu = await getMenu();
  return <OrderBuilder menu={menu} mode="create" />;
}
