import { createFileRoute } from "@tanstack/react-router";
import { Classes } from "./-components/classes";
import { CoreValues } from "./-components/core-values";
import { HeadCoach } from "./-components/head-coach";
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
			<HeadCoach />
			<Story />
			<CoreValues />
			<LifeAtHFS />
			<Classes />
			<TakeTheFirstSteps />
		</div>
	);
}
