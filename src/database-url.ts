import { isAbsolute, join } from "node:path";

export function getDatabaseUrl() {
	return process.env.DATABASE_URL ?? "file:./prisma/dev.db";
}

export function getSqliteFilePath() {
	const databaseUrl = getDatabaseUrl();
	let filePath = databaseUrl.startsWith("file:")
		? databaseUrl.slice("file:".length)
		: databaseUrl;

	if (!isAbsolute(filePath)) {
		filePath = join(process.cwd(), filePath);
	}

	return filePath;
}
