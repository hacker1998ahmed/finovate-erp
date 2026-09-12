import { defineHandler } from "nitro";
import { readBody, getQuery, createError } from "nitro/h3";
import { db } from "../../db/index";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

// GET /api/auth
export default defineHandler(async (event) => {
  const query = getQuery(event);
  const email = (query.email as string) || "";

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: "email is required" });
  }

  const user = db.select().from(users).where(eq(users.email, email)).get();

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "user not found" });
  }

  return { data: { id: user.id, email: user.email, name: user.name, role: user.role } };
});

// POST /api/auth
export const post = defineHandler(async (event) => {
  const body = await readBody<{
    email: string;
    password: string;
  }>(event);

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: "email and password are required" });
  }

  const user = db.select().from(users).where(eq(users.email, body.email)).get();

  if (!user || user.password !== body.password) {
    throw createError({ statusCode: 401, statusMessage: "invalid credentials" });
  }

  return { data: { id: user.id, email: user.email, name: user.name, role: user.role } };
});