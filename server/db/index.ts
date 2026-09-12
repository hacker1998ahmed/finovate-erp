import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const database = new Database(":memory:");
export const db = drizzle(database, { schema });