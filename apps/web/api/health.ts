/**
 * Health check endpoint
 * GET /api/health
 *
 * Verifies DB connectivity. Returns 503 if DB is down.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./_lib/db.js";
import { jsonSuccess, methodRouter } from "./_lib/http.js";

export default methodRouter({
	GET: async (_req: VercelRequest, res: VercelResponse) => {
		let dbOk = false;
		try {
			await sql`SELECT 1`;
			dbOk = true;
		} catch {
			// DB unreachable
		}
		if (!dbOk) {
			jsonSuccess(
				res,
				{
					status: "degraded",
					db: "error",
					timestamp: new Date().toISOString(),
				},
				503,
			);
			return;
		}
		jsonSuccess(res, {
			status: "ok",
			db: "ok",
			timestamp: new Date().toISOString(),
		});
	},
});
