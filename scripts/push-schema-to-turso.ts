import { createClient } from "@libsql/client";
import { getTursoAuthToken, getTursoDatabaseUrl } from "../src/database-url.js";

const turso = createClient({
	url: getTursoDatabaseUrl(),
	authToken: getTursoAuthToken(),
});

const result = Bun.spawnSync(
	[
		"bunx",
		"prisma",
		"migrate",
		"diff",
		"--from-empty",
		"--to-schema",
		"prisma/schema.prisma",
		"--script",
	],
	{ cwd: process.cwd(), stdout: "pipe", stderr: "pipe", env: process.env },
);

if (result.exitCode !== 0) {
	console.error(result.stderr.toString());
	process.exit(result.exitCode ?? 1);
}

const sql = result.stdout
	.toString()
	.split("\n")
	.filter((line) => !line.trim().startsWith("--"))
	.join("\n");
const statements = sql
	.split(";")
	.map((statement) => statement.trim())
	.filter((statement) => statement.length > 0);

for (const statement of statements) {
	const safe = statement
		.replace(/^CREATE TABLE "/i, 'CREATE TABLE IF NOT EXISTS "')
		.replace(/^CREATE UNIQUE INDEX "/i, 'CREATE UNIQUE INDEX IF NOT EXISTS "')
		.replace(/^CREATE INDEX "/i, 'CREATE INDEX IF NOT EXISTS "');
	await turso.execute(safe);
	console.log(`Applied: ${safe.slice(0, 80)}...`);
}

console.log(`Applied ${statements.length} schema statements to Turso.`);
