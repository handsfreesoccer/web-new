import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { getPrisma } from "#/db";
import { requireAdmin } from "#/server/admin-request";

const PER_PAGE = 10;

export const Route = createFileRoute("/api/admin/contact-inquiries")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const auth = await requireAdmin(request);
				if (auth.error) return auth.error;
				const url = new URL(request.url);
				const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
				const q = url.searchParams.get("q")?.trim() ?? "";
				const where = q
					? {
							OR: [
								{ fullName: { contains: q } },
								{ email: { contains: q } },
							],
						}
					: undefined;
				const prisma = await getPrisma();
				const [items, total] = await Promise.all([
					prisma.contactInquiry.findMany({
						where,
						orderBy: { createdAt: "desc" },
						skip: (page - 1) * PER_PAGE,
						take: PER_PAGE,
					}),
					prisma.contactInquiry.count({ where }),
				]);
				return Response.json({
					success: true,
					message: "Contact inquiries loaded.",
					data: items,
					meta: {
						pagination: {
							current_page: page,
							total_pages: Math.ceil(total / PER_PAGE) || 1,
							total,
							per_page: PER_PAGE,
						},
					},
				});
			},
		},
	},
});
