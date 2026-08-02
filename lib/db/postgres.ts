import { Pool, type PoolClient, type QueryResultRow } from "pg";

type GlobalWithPg = typeof globalThis & {
  itemsPgPool?: Pool;
};

function shouldUseSsl(connectionString: string) {
  return process.env.PGSSLMODE === "require" || connectionString.includes("supabase.co");
}

export function getPostgresPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL must be configured.");
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
  const result = await pool.query<T>(text, values);
  return result.rows;
}

export async function queryRow<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  const rows = await queryRows<T>(text, values);
  return rows[0] ?? null;
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPostgresPool();

  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
