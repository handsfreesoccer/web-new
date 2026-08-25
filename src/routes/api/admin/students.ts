import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { getPrisma } from "#/db";
import { requireAdmin } from "#/server/admin-request";

export const Route = createFileRoute("/api/admin/students")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const auth = await requireAdmin(request);
				if (auth.error) return auth.error;
				const url = new URL(request.url);
				const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
				const perPage = 20;
				const prisma = await getPrisma();
				const [items, total] = await Promise.all([
					prisma.booking.findMany({
						orderBy: { appointmentStartUtc: "desc" },
						skip: (page - 1) * perPage,
						take: perPage,
						include: {
							attendances: { orderBy: { attendedAt: "desc" }, take: 1 },
							_count: { select: { attendances: true } },
						},
					}),
					prisma.booking.count(),
				]);
				return Response.json({
					success: true,
					message: "Students loaded.",
					data: items,
					meta: {
						pagination: {
							current_page: page,
							total_pages: Math.ceil(total / perPage),
							total,
							per_page: perPage,
						},
					},
				});
			},
		},
	},
});
