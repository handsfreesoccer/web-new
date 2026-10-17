import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRef } from "react";
import { Footer } from "#/components/layouts/Footer";
import { Navbar } from "#/components/layouts/Navbar";
import { useScrollReveal } from "#/hooks/use-scroll-reveal";

export const Route = createFileRoute("/_layout")({
	component: RouteComponent,
});

function RouteComponent() {
	const mainRef = useRef<HTMLElement>(null);
	useScrollReveal(mainRef);

	return (
		<main ref={mainRef} className="flex min-h-screen flex-col items-stretch">
			<Navbar />
			<Outlet />
			<Footer />
		</main>
	);
}
