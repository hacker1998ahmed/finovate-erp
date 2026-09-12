import { defineHandler } from "nitro";
import { getQuery } from "nitro/h3";
import { db } from "../../db/index";
import { orders, expenses, products, customers } from "../../db/schema";
import { sql, eq, desc } from "drizzle-orm";

// GET /api/reports
export default defineHandler(async (event) => {
  const query = getQuery(event);
  const type = (query.type as string) || "summary";

  switch (type) {
    case "summary": {
      const [totalRevenue] = await db.select({ sum: sql<number>`COALESCE(SUM(${orders.total}), 0)` }).from(orders);
      const [totalExpenses] = await db.select({ sum: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` }).from(expenses);
      const [totalOrders] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
      const [totalCustomers] = await db.select({ count: sql<number>`COUNT(*)` }).from(customers);
      const [totalProducts] = await db.select({ count: sql<number>`COUNT(*)` }).from(products);

      return {
        type: "summary",
        data: {
          revenue: Number(totalRevenue?.sum) || 0,
          expenses: Number(totalExpenses?.sum) || 0,
          profit: (Number(totalRevenue?.sum) || 0) - (Number(totalExpenses?.sum) || 0),
          orders: Number(totalOrders?.count) || 0,
          customers: Number(totalCustomers?.count) || 0,
          products: Number(totalProducts?.count) || 0,
        },
      };
    }

    case "sales": {
      const salesByMonth = await db
        .select({
          month: sql<string>`strftime('%Y-%m', ${orders.createdAt})`,
          total: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(orders)
        .groupBy(sql`strftime('%Y-%m', ${orders.createdAt})`)
        .orderBy(desc(sql`strftime('%Y-%m', ${orders.createdAt})`))
        .all();

      return { type: "sales", data: salesByMonth };
    }

    case "inventory": {
      const lowStock = await db
        .select()
        .from(products)
        .where(sql`${products.quantity} < ${products.minStock}`)
        .orderBy(products.id)
        .all();

      return { type: "inventory", data: lowStock };
    }

    case "expenses": {
      const expensesByCategory = await db
        .select({
          category: expenses.category,
          total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(expenses)
        .groupBy(expenses.category)
        .orderBy(desc(sql`COALESCE(SUM(${expenses.amount}), 0)`))
        .all();

      return { type: "expenses", data: expensesByCategory };
    }

    default:
      return { type: "summary", data: {} };
  }
});