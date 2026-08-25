import { PrismaClient } from '../src/generated/prisma/client.js'
import { getDatabaseUrl } from '../src/database-url.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: getDatabaseUrl(),
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.attendance.deleteMany()
  await prisma.emailLog.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.adminMagicLink.deleteMany()
  await prisma.adminSession.deleteMany()
  console.log('✅ Database cleared')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
