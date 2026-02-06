/**
 * Logout and clear session.
 * POST /api/auth/logout
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearSessionCookie, parseCookieHeader } from "../_lib/auth.js";
import { sql } from "../_lib/db.js";
import { jsonSuccess, methodRouter } from "../_lib/http.js";

const SESSION_COOKIE_NAME = "ai_session";

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const cookies = parseCookieHeader(req.headers.cookie);
		const sessionId = cookies[SESSION_COOKIE_NAME];
		if (sessionId) {
			await sql`DELETE FROM auth_sessions WHERE id = ${sessionId}`;
		}
		clearSessionCookie(res);
		jsonSuccess(res, { ok: true });
	},
});
