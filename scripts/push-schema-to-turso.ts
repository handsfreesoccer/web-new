import { join } from "node:path";
import { createClient } from "@libsql/client";
import { Database } from "bun:sqlite";
import { getTursoAuthToken, getTursoDatabaseUrl } from "../src/database-url.js";

const localPath = join(process.cwd(), "prisma/dev.db");
const local = new Database(localPath, { readonly: true });
const schema = local.query("SELECT sql FROM sqlite_master WHERE type IN ('table', 'index') AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'").all() as Array<{ sql: string }>;
local.close();

const turso = createClient({
	url: getTursoDatabaseUrl(),
	authToken: getTursoAuthToken(),
});

for (const { sql } of schema) {
	const statement = sql
		.replace(/^CREATE TABLE "/, 'CREATE TABLE IF NOT EXISTS "')
		.replace(/^CREATE UNIQUE INDEX "/, 'CREATE UNIQUE INDEX IF NOT EXISTS "')
		.replace(/^CREATE INDEX "/, 'CREATE INDEX IF NOT EXISTS "');
	await turso.execute(statement);
	console.log(`Applied: ${statement.slice(0, 80)}...`);
}

console.log(`Applied ${schema.length} schema statements to Turso.`);
