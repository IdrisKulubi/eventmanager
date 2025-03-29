import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const poolConfig = {
  connectionString: process.env.POSTGRES_URL!,
  min: Number(process.env.POSTGRES_POOL_MIN || 5),
  max: Number(process.env.POSTGRES_POOL_MAX || 20),
  idleTimeoutMillis: Number(process.env.POSTGRES_IDLE_TIMEOUT || 30000),
  connectionTimeoutMillis: 5000, // 5 seconds
  maxUses: 10000, // Number of times a connection can be used before being destroyed
};

// Create connection pool
const pool = new Pool(poolConfig);

// Create drizzle instance with the pool
const db = drizzle(pool, { schema });

// Export the db instance and pool for potential direct usage
export { pool };
export default db;
