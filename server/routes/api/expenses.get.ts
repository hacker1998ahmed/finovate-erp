import { defineHandler } from "nitro";
import { readBody, getQuery, getRouterParam, createError } from "nitro/h3";
import { db } from "../../db/index";
import { expenses } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/expenses
export default defineHandler(async (event) => {
  const query = getQuery(event);
  const page = Number((query.page as string) || "1");
  const limit = Number((query.limit as string) || "20");
  const offset = (page - 1) * limit;

  const allExpenses = await db.select().from(expenses).orderBy(desc(expenses.id)).all();
  const paginated = allExpenses.slice(offset, offset + limit);

  return {
    data: paginated,
    total: allExpenses.length,
    page,
    limit,
  };
});

// POST /api/expenses
export const post = defineHandler(async (event) => {
  const body = await readBody<{
    date: string;
    category: string;
    amount: number;
    description?: string;
    paymentMethod?: string;
  }>(event);

  if (!body.date || !body.category || !body.amount) {
    throw createError({ statusCode: 400, statusMessage: "date, category and amount are required" });
  }

  const expense = db
    .insert(expenses)
    .values(body)
    .returning()
    .get();

  return { data: expense };
});

// PUT /api/expenses/:id
export const put = defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody<Partial<typeof expenses.$inferInsert>>(event);

  const expense = db
    .update(expenses)
    .set(body)
    .where(eq(expenses.id, id))
    .returning()
    .get();

  return { data: expense };
});

// DELETE /api/expenses/:id
export const delete_ = defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  db.delete(expenses).where(eq(expenses.id, id)).run();
  return { success: true };
});