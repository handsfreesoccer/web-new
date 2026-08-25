import { type PrismaClient, Prisma } from "./generated/prisma/client.js";

const CLIENT_SCHEMA_KEY = JSON.stringify({
	Booking: Prisma.BookingScalarFieldEnum,
	BookingAvailability: Prisma.BookingAvailabilityScalarFieldEnum,
	Attendance: Prisma.AttendanceScalarFieldEnum,
	EmailLog: Prisma.EmailLogScalarFieldEnum,
});

declare global {
	var __prisma: PrismaClient | undefined;
	var __prismaSchemaKey: string | undefined;
	var __prismaInit: Promise<PrismaClient> | undefined;
}

async function loadPrismaClient() {
	if (typeof (globalThis as { Bun?: unknown }).Bun !== "undefined") {
		const { createBunPrismaClient } = await import("./db.bun.js");
		return createBunPrismaClient();
	}
	const { createNodePrismaClient } = await import("./db.node.js");
	return createNodePrismaClient();
}

export async function getPrisma() {
	const staleClient =
		globalThis.__prisma &&
		globalThis.__prismaSchemaKey !== CLIENT_SCHEMA_KEY;

	if (staleClient) {
		void globalThis.__prisma?.$disconnect();
		globalThis.__prisma = undefined;
		globalThis.__prismaSchemaKey = undefined;
		globalThis.__prismaInit = undefined;
	}

	if (globalThis.__prisma) {
		return globalThis.__prisma;
	}

	globalThis.__prismaInit ??= loadPrismaClient().then((client) => {
		globalThis.__prisma = client;
		globalThis.__prismaSchemaKey = CLIENT_SCHEMA_KEY;
		return client;
	});

	return globalThis.__prismaInit;
}

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		void globalThis.__prisma?.$disconnect();
		globalThis.__prisma = undefined;
		globalThis.__prismaSchemaKey = undefined;
		globalThis.__prismaInit = undefined;
	});
}
