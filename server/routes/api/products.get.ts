import { defineHandler } from "nitro";
import { readBody, getQuery, getRouterParam, createError } from "nitro/h3";
import { db } from "../../db/index";
import { products } from "../../db/schema";
import { eq, desc, sql } from "drizzle-orm";

// GET /api/products
export default defineHandler(async (event) => {
  const query = getQuery(event);
  const search = (query.search as string) || "";
  const category = (query.category as string) || "";
  const page = Number((query.page as string) || "1");
  const limit = Number((query.limit as string) || "20");
  const offset = (page - 1) * limit;

  let queryBuilder = db.select().from(products);

  if (search) {
    queryBuilder = queryBuilder.where(
      sql`${products.name} LIKE ${`%${search}%`} OR ${products.sku} LIKE ${`%${search}%`}`
    );
  }

  if (category) {
    queryBuilder = queryBuilder.where(eq(products.category, category));
  }

  const allProducts = await queryBuilder.orderBy(desc(products.id)).all();
  const paginated = allProducts.slice(offset, offset + limit);

  return {
    data: paginated,
    total: allProducts.length,
    page,
    limit,
  };
});

// POST /api/products
export const post = defineHandler(async (event) => {
  const body = await readBody<{
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    price: number;
    cost: number;
    quantity?: number;
    minStock?: number;
    category?: string;
    supplier?: string;
  }>(event);

  if (!body.name || !body.sku) {
    throw createError({ statusCode: 400, statusMessage: "name and sku are required" });
  }

  const now = new Date().toISOString();
  const product = db
    .insert(products)
    .values({
      ...body,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  return { data: product };
});

// PUT /api/products/:id
export const put = defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody<Partial<typeof products.$inferInsert>>(event);

  const now = new Date().toISOString();
  const product = db
    .update(products)
    .set({ ...body, updatedAt: now })
    .where(eq(products.id, id))
    .returning()
    .get();

  return { data: product };
});

// DELETE /api/products/:id
export const delete_ = defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  db.delete(products).where(eq(products.id, id)).run();
  return { success: true };
});