import { PrismaLibSql } from "@prisma/adapter-libsql";
import { Prisma, PrismaClient } from "./generated/prisma/client.js";
import { getTursoAuthToken, getTursoDatabaseUrl } from "./database-url.js";

const CLIENT_SCHEMA_KEY = JSON.stringify({
	Booking: Prisma.BookingScalarFieldEnum,
	BookingAvailability: Prisma.BookingAvailabilityScalarFieldEnum,
	Attendance: Prisma.AttendanceScalarFieldEnum,
	EmailLog: Prisma.EmailLogScalarFieldEnum,
	ContactInquiry: Prisma.ContactInquiryScalarFieldEnum,
	CronJob: Prisma.CronJobScalarFieldEnum,
});

declare global {
	var __prisma: PrismaClient | undefined;
	var __prismaSchemaKey: string | undefined;
}

function createPrismaClient() {
	const adapter = new PrismaLibSql({
		url: getTursoDatabaseUrl(),
		authToken: getTursoAuthToken(),
	});
	return new PrismaClient({ adapter });
}

export async function getPrisma() {
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

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		void globalThis.__prisma?.$disconnect();
		globalThis.__prisma = undefined;
		globalThis.__prismaSchemaKey = undefined;
	});
}
