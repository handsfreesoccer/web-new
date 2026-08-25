import { PrismaClient, Prisma } from "./generated/prisma/client.js";
import { getDatabaseUrl } from "./database-url.js";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";

const CLIENT_SCHEMA_KEY = JSON.stringify({
	Booking: Prisma.BookingScalarFieldEnum,
	BookingAvailability: Prisma.BookingAvailabilityScalarFieldEnum,
	Attendance: Prisma.AttendanceScalarFieldEnum,
	EmailLog: Prisma.EmailLogScalarFieldEnum,
});

declare global {
	var __prisma: PrismaClient | undefined;
	var __prismaSchemaKey: string | undefined;
}

function createPrismaClient() {
	const adapter = new PrismaBunSqlite({
		url: getDatabaseUrl(),
	});
	return new PrismaClient({ adapter });
}

function getPrismaClient() {
	const staleClient =
		globalThis.__prisma &&
		globalThis.__prismaSchemaKey !== CLIENT_SCHEMA_KEY;

	if (staleClient) {
		void globalThis.__prisma?.$disconnect();
		globalThis.__prisma = undefined;
		globalThis.__prismaSchemaKey = undefined;
	}

	if (!globalThis.__prisma) {
		globalThis.__prisma = createPrismaClient();
		globalThis.__prismaSchemaKey = CLIENT_SCHEMA_KEY;
	}

	return globalThis.__prisma;
}

export const prisma = getPrismaClient();

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		void globalThis.__prisma?.$disconnect();
		globalThis.__prisma = undefined;
		globalThis.__prismaSchemaKey = undefined;
	});
}
