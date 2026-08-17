import { Footer } from "#/components/layouts/Footer";
import { Navbar } from "#/components/layouts/Navbar";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="min-h-screen flex flex-col">
			<Navbar />
			<Outlet />
			<Footer />
		</main>
	);
}
