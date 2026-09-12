import { defineHandler } from "nitro";
import { db } from "../../db/index";
import { kpiMetrics, products, customers, orders, expenses } from "../../db/schema";
import { eq, gte, lte, sql, count, sum } from "drizzle-orm";
import { getQuery } from "nitro/h3";

export default defineHandler(async (event) => {
  const query = getQuery(event);
  const period = (query.period as string) || "30d";

  const now = new Date();
  const startDate = new Date();
  if (period === "7d") {
    startDate.setDate(now.getDate() - 7);
  } else if (period === "90d") {
    startDate.setDate(now.getDate() - 90);
  } else {
    startDate.setDate(now.getDate() - 30);
  }

  const [totalProducts] = await db.select({ count: count() }).from(products);
  const [totalCustomers] = await db.select({ count: count() }).from(customers);
  const [totalOrders] = await db.select({ count: count() }).from(orders);
  const [totalRevenue] = await db.select({ sum: sum(orders.total) }).from(orders);
  const [totalExpenses] = await db.select({ sum: sum(expenses.amount) }).from(expenses);
  const [totalProfit] = await db.select({ sum: sum(orders.total) }).from(orders);

  const revenue = Number(totalRevenue?.sum) || 0;
  const expensesTotal = Number(totalExpenses?.sum) || 0;
  const profit = revenue - expensesTotal;

  // Recent orders
  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(5);

  // Low stock products
  const lowStockProducts = await db
    .select()
    .from(products)
    .where(sql`${products.quantity} < ${products.minStock}`)
    .limit(5);

  return {
    kpi: {
      revenue,
      orders: Number(totalOrders?.count) || 0,
      customers: Number(totalCustomers?.count) || 0,
      products: Number(totalProducts?.count) || 0,
      profit,
    },
    recentOrders,
    lowStockProducts,
  };
});