import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { AdminAuthGuard } from "#/routes/admin/-components/admin-auth-guard";
import { AttendanceDashboard } from "#/routes/admin/-components/attendance-dashboard";
import { BookingAvailabilitySettings } from "#/routes/admin/-components/booking-availability-settings";
import { pageTitle } from "#/lib/site-meta";

export const Route = createFileRoute("/admin/")({
	head: () => ({
		meta: [{ title: pageTitle("Admin Dashboard") }],
	}),
	component: AdminPage,
});

function AdminPage() {
	const navigate = useNavigate();

	return (
		<AdminAuthGuard>
			<main className="flex min-h-screen flex-col bg-(--bg-base) px-4 py-8 sm:px-10">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div className="flex flex-col gap-2">
							<p className="font-bold text-primary text-sm tracking-[.16em]">
								HANDS FREE SOCCER
							</p>
							<h1 className="font-bold text-4xl text-secondary">
								Students dashboard
							</h1>
						</div>
						<Button
							variant="outline"
							onClick={() => {
								localStorage.removeItem("hfs_access_token");
								void navigate({ to: "/admin/login" });
							}}
						>
							Sign out
						</Button>
					</div>

					<BookingAvailabilitySettings />
					<AttendanceDashboard />
				</div>
			</main>
		</AdminAuthGuard>
	);
}
