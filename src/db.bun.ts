import { PrismaClient } from "./generated/prisma/client.js";
import { getDatabaseUrl } from "./database-url.js";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";

export function createBunPrismaClient() {
	const adapter = new PrismaBunSqlite({
		url: getDatabaseUrl(),
	});
	return new PrismaClient({ adapter });
}
