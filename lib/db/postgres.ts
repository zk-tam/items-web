import { Pool, type QueryResultRow } from "pg";

type GlobalWithPg = typeof globalThis & {
  itemsPgPool?: Pool;
};

function shouldUseSsl(connectionString: string) {
  return process.env.PGSSLMODE === "require" || connectionString.includes("supabase.co");
}

export function getPostgresPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  const globalWithPg = globalThis as GlobalWithPg;

  if (!globalWithPg.itemsPgPool) {
    globalWithPg.itemsPgPool = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString)
        ? {
            rejectUnauthorized: false
          }
        : undefined
    });
  }

  return globalWithPg.itemsPgPool;
}

export async function queryRows<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  const pool = getPostgresPool();

  if (!pool) {
    return null;
  }

  const result = await pool.query<T>(text, values);
  return result.rows;
}
