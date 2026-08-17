import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "#/components/layouts/Footer";
import { Navbar } from "#/components/layouts/Navbar";

export const Route = createFileRoute("/_layout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex min-h-screen flex-col items-stretch">
			<Navbar />
			<Outlet />
			<Footer />
		</main>
	);
}
