export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

  return databaseUrl
}
