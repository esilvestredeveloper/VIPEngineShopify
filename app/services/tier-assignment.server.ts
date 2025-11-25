import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import prisma from "../db.server";

/**
 * Servicio para asignar niveles automáticamente a clientes
 * basándose en su historial de compras
 */

interface CustomerStats {
  totalSpent: number;
  totalOrders: number;
}

/**
 * Obtiene las estadísticas de un cliente desde Shopify
 */
export async function getCustomerStats(
  admin: AdminApiContext,
  customerId: string
): Promise<CustomerStats> {
  const response = await admin.graphql(
    `#graphql
      query getCustomerStats($id: ID!) {
        customer(id: $id) {
          id
          numberOfOrders
          amountSpent {
            amount
          }
        }
      }
    `,
    {
      variables: { id: customerId },
    }
  );

  const data = await response.json();
  const customer = data.data?.customer;

  if (!customer) {
    throw new Error(`Customer ${customerId} not found`);
  }

  return {
    totalSpent: parseFloat(customer.amountSpent?.amount || "0"),
    totalOrders: customer.numberOfOrders || 0,
  };
}

/**
 * Determina qué nivel le corresponde a un cliente
 * basándose en sus estadísticas
 */
export async function calculateTierForCustomer(
  shop: string,
  stats: CustomerStats
): Promise<string | null> {
  // Obtener todos los niveles activos ordenados por prioridad
  const tiers = await prisma.customerTier.findMany({
    where: {
      shop,
      active: true,
    },
    orderBy: {
      priority: "desc", // Mayor prioridad primero
    },
  });

  // Buscar el primer nivel que cumpla los requisitos
  for (const tier of tiers) {
    const meetsSpentRequirement = stats.totalSpent >= tier.minSpent;
    const meetsOrdersRequirement = stats.totalOrders >= tier.minOrders;

    if (meetsSpentRequirement && meetsOrdersRequirement) {
      return tier.id;
    }
  }

  // No cumple con ningún nivel
  return null;
}

/**
 * Asigna o actualiza el nivel de un cliente
 */
export async function assignTierToCustomer(
  shop: string,
  customerId: string,
  tierId: string | null
): Promise<void> {
  // Buscar asignación existente
  const existingAssignment = await prisma.customerTierAssignment.findFirst({
    where: {
      shop,
      customerId,
    },
  });

  if (tierId === null) {
    // El cliente ya no cumple con ningún nivel
    if (existingAssignment) {
      // Eliminar asignación existente
      await prisma.customerTierAssignment.delete({
        where: { id: existingAssignment.id },
      });
      console.log(`[TierAssignment] Removed tier for customer ${customerId}`);
    }
    return;
  }

  if (existingAssignment) {
    // Verificar si cambió el nivel
    if (existingAssignment.tierId !== tierId) {
      // Actualizar al nuevo nivel
      await prisma.customerTierAssignment.update({
        where: { id: existingAssignment.id },
        data: {
          tierId,
          assignedAt: new Date(),
        },
      });
      console.log(
        `[TierAssignment] Updated customer ${customerId} from tier ${existingAssignment.tierId} to ${tierId}`
      );
    } else {
      console.log(
        `[TierAssignment] Customer ${customerId} already has tier ${tierId}, no change needed`
      );
    }
  } else {
    // Crear nueva asignación
    await prisma.customerTierAssignment.create({
      data: {
        shop,
        customerId,
        tierId,
        assignedAt: new Date(),
      },
    });
    console.log(`[TierAssignment] Assigned tier ${tierId} to customer ${customerId}`);
  }
}

/**
 * Procesa la asignación automática de nivel para un cliente
 * Esta es la función principal que se llama desde los webhooks
 */
export async function processCustomerTierAssignment(
  admin: AdminApiContext,
  shop: string,
  customerId: string
): Promise<{
  success: boolean;
  tierId: string | null;
  message: string;
}> {
  try {
    // 1. Obtener estadísticas del cliente desde Shopify
    const stats = await getCustomerStats(admin, customerId);
    console.log(`[TierAssignment] Customer ${customerId} stats:`, stats);

    // 2. Calcular qué nivel le corresponde
    const tierId = await calculateTierForCustomer(shop, stats);
    console.log(`[TierAssignment] Calculated tier for customer ${customerId}:`, tierId);

    // 3. Asignar o actualizar el nivel
    await assignTierToCustomer(shop, customerId, tierId);

    return {
      success: true,
      tierId,
      message: tierId
        ? `Customer assigned to tier ${tierId}`
        : "Customer removed from all tiers (doesn't meet requirements)",
    };
  } catch (error) {
    console.error(`[TierAssignment] Error processing customer ${customerId}:`, error);
    return {
      success: false,
      tierId: null,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Recalcula los niveles de TODOS los clientes de una tienda
 * Útil para sincronización inicial o después de cambiar criterios de niveles
 */
export async function recalculateAllTiers(
  admin: AdminApiContext,
  shop: string
): Promise<{
  processed: number;
  updated: number;
  errors: number;
}> {
  let processed = 0;
  let updated = 0;
  let errors = 0;

  // Obtener todos los clientes de Shopify (con paginación)
  let hasNextPage = true;
  let endCursor: string | null = null;

  while (hasNextPage) {
    const response = await admin.graphql(
      `#graphql
        query getCustomers($cursor: String) {
          customers(first: 50, after: $cursor) {
            edges {
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      {
        variables: { cursor: endCursor },
      }
    );

    const data = await response.json();
    const customers = data.data?.customers?.edges || [];
    const pageInfo = data.data?.customers?.pageInfo;

    for (const edge of customers) {
      const customerId = edge.node.id;
      processed++;

      try {
        const result = await processCustomerTierAssignment(admin, shop, customerId);
        if (result.success && result.tierId) {
          updated++;
        }
      } catch (error) {
        console.error(`Error processing customer ${customerId}:`, error);
        errors++;
      }
    }

    hasNextPage = pageInfo?.hasNextPage || false;
    endCursor = pageInfo?.endCursor || null;
  }

  console.log(
    `[TierAssignment] Recalculation complete: ${processed} processed, ${updated} updated, ${errors} errors`
  );

  return { processed, updated, errors };
}