import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const poolConfig = {
  connectionString: process.env.POSTGRES_URL!,
  min: Number(process.env.POSTGRES_POOL_MIN || 5),
  max: Number(process.env.POSTGRES_POOL_MAX || 20),
  idleTimeoutMillis: Number(process.env.POSTGRES_IDLE_TIMEOUT || 30000),
  connectionTimeoutMillis: 5000, /
  maxUses: 10000, 
};

const pool = new Pool(poolConfig);

const db = drizzle(pool, { schema });

export { pool };
export default db;
