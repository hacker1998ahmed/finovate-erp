import { defineHandler } from "nitro";
import { readBody, getQuery, getRouterParam, createError } from "nitro/h3";
import { db } from "../../db/index";
import { orders, orderItems, products, customers } from "../../db/schema";
import { eq, desc, sql } from "drizzle-orm";

// GET /api/orders
export default defineHandler(async (event) => {
  const query = getQuery(event);
  const status = (query.status as string) || "";
  const page = Number((query.page as string) || "1");
  const limit = Number((query.limit as string) || "20");
  const offset = (page - 1) * limit;

  let queryBuilder = db.select().from(orders);

  if (status) {
    queryBuilder = queryBuilder.where(eq(orders.status, status));
  }

  const allOrders = await queryBuilder.orderBy(desc(orders.id)).all();
  const paginated = allOrders.slice(offset, offset + limit);

  // Enrich with customer info
  const enriched = await Promise.all(
    paginated.map(async (order) => {
      const customer = order.customerId
        ? db.select().from(customers).where(eq(customers.id, order.customerId)).get()
        : null;
      const items = db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).all();
      return {
        ...order,
        customer,
        items,
      };
    })
  );

  return {
    data: enriched,
    total: allOrders.length,
    page,
    limit,
  };
});

// POST /api/orders
export const post = defineHandler(async (event) => {
  const body = await readBody<{
    customerId?: number;
    status?: string;
    items: { productId: number; quantity: number; price: number }[];
    tax?: number;
    discount?: number;
    notes?: string;
  }>(event);

  if (!body.items || body.items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "items are required" });
  }

  const now = new Date().toISOString();
  const orderNumber = `ORD-${Date.now()}`;

  // Calculate totals
  const subtotal = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = body.tax || 0;
  const discount = body.discount || 0;
  const total = subtotal + tax - discount;

  // Create order
  const order = db
    .insert(orders)
    .values({
      orderNumber,
      customerId: body.customerId,
      status: body.status || "pending",
      total,
      tax,
      discount,
      notes: body.notes,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  // Create order items
  for (const item of body.items) {
    db.insert(orderItems).values({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    }).run();

    // Update product stock
    db.update(products)
      .set({ quantity: sql`${products.quantity} - ${item.quantity}`, updatedAt: now })
      .where(eq(products.id, item.productId))
      .run();
  }

  return { data: order };
});

// PUT /api/orders/:id
export const put = defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody<Partial<typeof orders.$inferInsert>>(event);

  const now = new Date().toISOString();
  const order = db
    .update(orders)
    .set({ ...body, updatedAt: now })
    .where(eq(orders.id, id))
    .returning()
    .get();

  return { data: order };
});

// DELETE /api/orders/:id
export const delete_ = defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  db.delete(orderItems).where(eq(orderItems.orderId, id)).run();
  db.delete(orders).where(eq(orders.id, id)).run();
  return { success: true };
});