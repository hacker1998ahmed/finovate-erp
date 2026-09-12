import { defineHandler } from "nitro";
import { readBody, getQuery, getRouterParam, createError } from "nitro/h3";
import { db } from "../../db/index";
import { customers } from "../../db/schema";
import { eq, desc, sql } from "drizzle-orm";

// GET /api/customers
export default defineHandler(async (event) => {
  const query = getQuery(event);
  const search = (query.search as string) || "";
  const page = Number((query.page as string) || "1");
  const limit = Number((query.limit as string) || "20");
  const offset = (page - 1) * limit;

  let queryBuilder = db.select().from(customers);

  if (search) {
    queryBuilder = queryBuilder.where(
      sql`${customers.name} LIKE ${`%${search}%`} OR ${customers.email} LIKE ${`%${search}%`}`
    );
  }

  const allCustomers = await queryBuilder.orderBy(desc(customers.id)).all();
  const paginated = allCustomers.slice(offset, offset + limit);

  return {
    data: paginated,
    total: allCustomers.length,
    page,
    limit,
  };
});

// POST /api/customers
export const post = defineHandler(async (event) => {
  const body = await readBody<{
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }>(event);

  if (!body.name || !body.email) {
    throw createError({ statusCode: 400, statusMessage: "name and email are required" });
  }

  const now = new Date().toISOString();
  const customer = db
    .insert(customers)
    .values({
      ...body,
      createdAt: now,
    })
    .returning()
    .get();

  return { data: customer };
});

// PUT /api/customers/:id
export const put = defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody<Partial<typeof customers.$inferInsert>>(event);

  const now = new Date().toISOString();
  const customer = db
    .update(customers)
    .set({ ...body, updatedAt: now })
    .where(eq(customers.id, id))
    .returning()
    .get();

  return { data: customer };
});

// DELETE /api/customers/:id
export const delete_ = defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  db.delete(customers).where(eq(customers.id, id)).run();
  return { success: true };
});