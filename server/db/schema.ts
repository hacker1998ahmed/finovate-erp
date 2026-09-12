import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Dashboard KPIs
export const kpiMetrics = sqliteTable("kpi_metrics", {
  id: integer().primaryKey({ autoIncrement: true }),
  date: text().notNull(),
  revenue: real().notNull().default(0),
  orders: integer().notNull().default(0),
  customers: integer().notNull().default(0),
  products: integer().notNull().default(0),
  profit: real().notNull().default(0),
});

// Products/Inventory
export const products = sqliteTable("products", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  sku: text().notNull().unique(),
  barcode: text(),
  description: text(),
  price: real().notNull().default(0),
  cost: real().notNull().default(0),
  quantity: integer().notNull().default(0),
  minStock: integer().notNull().default(10),
  category: text(),
  supplier: text(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});

// Customers
export const customers = sqliteTable("customers", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().unique(),
  phone: text(),
  address: text(),
  city: text(),
  country: text(),
  createdAt: text().notNull(),
});

// Orders/Sales
export const orders = sqliteTable("orders", {
  id: integer().primaryKey({ autoIncrement: true }),
  orderNumber: text().notNull().unique(),
  customerId: integer().references(() => customers.id),
  status: text().notNull().default("pending"),
  total: real().notNull().default(0),
  tax: real().notNull().default(0),
  discount: real().notNull().default(0),
  notes: text(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: integer().primaryKey({ autoIncrement: true }),
  orderId: integer().notNull().references(() => orders.id),
  productId: integer().notNull().references(() => products.id),
  quantity: integer().notNull(),
  price: real().notNull(),
  total: real().notNull(),
});

// Expenses
export const expenses = sqliteTable("expenses", {
  id: integer().primaryKey({ autoIncrement: true }),
  date: text().notNull(),
  category: text().notNull(),
  amount: real().notNull(),
  description: text(),
  paymentMethod: text().notNull().default("cash"),
});

// Users (for authentication)
export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  name: text().notNull(),
  role: text().notNull().default("user"),
  createdAt: text().notNull(),
});