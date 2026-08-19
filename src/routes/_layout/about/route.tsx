import { createFileRoute } from "@tanstack/react-router";
import { CoreValues } from "./-components/core-values";
import { HeroSection } from "./-components/hero-section";
import { LifeAtHFS } from "./-components/life-at-hfs";
import { Story } from "./-components/story";
import { TakeTheFirstSteps } from "./-components/take-the-first-steps";

export const Route = createFileRoute("/_layout/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex-1">
			<HeroSection />
			<Story />
			<CoreValues />
			<LifeAtHFS />
			<TakeTheFirstSteps />
		</div>
	);
}
