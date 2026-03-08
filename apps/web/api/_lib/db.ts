/**
 * Database client helper for Vercel Postgres
 */
import { type VercelPoolClient, sql } from "@vercel/postgres";

export type DbClient = VercelPoolClient;
export type DbExecutor = DbClient["sql"] | typeof sql;

interface DbRlsContext {
	currentUser?: string;
	/** Escalation for trusted internal flows like cron jobs. */
	systemRole?: boolean;
}

/**
 * Run work on a dedicated DB connection with explicit RLS session context.
 *
 * IMPORTANT: `@vercel/postgres` pooled `sql` does not guarantee that sequential
 * queries run on the same connection, so per-request `set_config(...)` values
 * can leak or be missing if we do not pin a client for the request.
 */
export async function withDbRlsContext<T>(
	context: DbRlsContext,
	work: (client: DbClient) => Promise<T>,
): Promise<T> {
	const client = await sql.connect();
	try {
		const currentUser = context.currentUser?.toLowerCase() ?? "";
		const role = context.systemRole ? "system" : "";
		await client.sql`
			SELECT
				set_config('app.current_user', ${currentUser}, false),
				set_config('app.role', ${role}, false)
		`;
		return await work(client);
	} finally {
		client.release();
	}
}

export { sql };
