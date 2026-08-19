import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "./-components/hero-section";
import { Story } from "./-components/story";

export const Route = createFileRoute("/_layout/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex-1">
			<HeroSection />
			<Story />
		</div>
	);
}
