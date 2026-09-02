import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { getTursoAuthToken, getTursoDatabaseUrl } from "../src/database-url.js";

const prisma = new PrismaClient({
	adapter: new PrismaLibSql({
		url: getTursoDatabaseUrl(),
		authToken: getTursoAuthToken(),
	}),
});

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
