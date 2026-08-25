import { verifyAccessToken } from "#/server/auth";
import { StatusCodes } from "http-status-codes";
import { failure } from "#/server/response";

export async function requireAdmin(request: Request) {
	const token = request.headers
		.get("authorization")
		?.replace(/^Bearer\s+/i, "");
	if (!token || !(await verifyAccessToken(token)))
		return { error: failure("Unauthorized", StatusCodes.UNAUTHORIZED) };
	return { authorized: true as const };
}
