export function getTursoDatabaseUrl() {
	const url =
		process.env.TURSO_DATABASE_URL?.trim() ||
		process.env.DATABASE_URL?.trim();

	if (!url) {
		throw new Error(
			"TURSO_DATABASE_URL (or DATABASE_URL) is required. Example: libsql://your-db.turso.io",
		);
	}

	return url;
}

export function getTursoAuthToken() {
	const token = process.env.TURSO_AUTH_TOKEN?.trim();
	if (!token) {
		throw new Error("TURSO_AUTH_TOKEN is required to connect to Turso.");
	}
	return token;
}
