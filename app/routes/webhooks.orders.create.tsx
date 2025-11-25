import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { processCustomerTierAssignment } from "../services/tier-assignment.server";
import { syncCustomerTierToShopify } from "../services/shopify-sync.server";

/**
 * Webhook: orders/create
 *
 * Se ejecuta automáticamente cada vez que se crea un pedido en Shopify.
 *
 * Flujo:
 * 1. Recibe notificación del pedido
 * 2. Obtiene el ID del cliente
 * 3. Calcula si el cliente cumple con algún nivel
 * 4. Asigna o actualiza el nivel del cliente
 * 5. Sincroniza el nivel con Shopify (tags)
 */

export const action = async ({ request }: ActionFunctionArgs) => {
  // Autenticar el webhook (verifica firma HMAC automáticamente)
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  console.log(`[Webhook] Received ${topic} for shop ${shop}`);

  // Verificar que sea el webhook correcto
  if (topic !== "ORDERS_CREATE") {
    console.warn(`[Webhook] Unexpected topic: ${topic}`);
    return new Response("Webhook received", { status: 200 });
  }

  try {
    // Extraer datos del pedido
    const order = payload as any;
    const customerId = order.customer?.id;

    if (!customerId) {
      console.log("[Webhook] Order has no customer, skipping tier assignment");
      return new Response("Order has no customer", { status: 200 });
    }

    // Convertir el ID del cliente al formato GID de Shopify
    // Los webhooks envían IDs numéricos, pero GraphQL usa GIDs
    const customerGid = customerId.toString().startsWith("gid://")
      ? customerId
      : `gid://shopify/Customer/${customerId}`;

    console.log(`[Webhook] Processing order ${order.id} for customer ${customerGid}`);

    // 1. Procesar asignación automática de nivel
    const assignmentResult = await processCustomerTierAssignment(
      admin,
      shop,
      customerGid
    );

    console.log(`[Webhook] Assignment result:`, assignmentResult);

    // 2. Sincronizar con Shopify (agregar tags)
    if (assignmentResult.success) {
      const syncResult = await syncCustomerTierToShopify(admin, customerGid, shop);
      console.log(`[Webhook] Sync result:`, syncResult);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);

    // Importante: Devolver 200 incluso si hay error
    // Si devolvemos error, Shopify reintentará el webhook
    return new Response("Webhook received with errors", { status: 200 });
  }
};