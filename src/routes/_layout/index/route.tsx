import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "./-components/hero-section";

export const Route = createFileRoute("/_layout/")({ component: Home });

function Home() {
	return (
		<div className="flex-1">
			<HeroSection />
		</div>
	);
}
