/**
 * Return authenticated wallet from session cookie.
 * GET /api/me
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSession } from "./_lib/auth.js";
import { authError, jsonSuccess, methodRouter } from "./_lib/http.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		try {
			const session = await requireSession(req);
			jsonSuccess(res, { walletAddress: session.walletAddress });
		} catch {
			authError(req, res, "Authentication required", 401);
		}
	},
});
