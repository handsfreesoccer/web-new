import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.js";
import { getSqliteFilePath } from "./database-url.js";

export function createNodePrismaClient() {
	const adapter = new PrismaBetterSqlite3({
		url: getSqliteFilePath(),
	});
	return new PrismaClient({ adapter });
}
