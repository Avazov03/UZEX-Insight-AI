import { Pool, type QueryResultRow } from 'pg';

const globalForPg = globalThis as unknown as { uzexPool?: Pool };

export function getPool(): Pool {
  if (!globalForPg.uzexPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    globalForPg.uzexPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 20_000
    });
  }
  return globalForPg.uzexPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}
