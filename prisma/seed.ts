import { PrismaClient } from "../src/generated/prisma/client.js";
import { getDatabaseUrl } from "../src/database-url.js";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";

const adapter = new PrismaBunSqlite({
	url: getDatabaseUrl(),
});

const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Seeding database...");

	await prisma.attendance.deleteMany();
	await prisma.emailLog.deleteMany();
	await prisma.booking.deleteMany();
	console.log("✅ Database cleared");
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
