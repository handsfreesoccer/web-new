import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "#/lib/site-meta";
import { LifeAtHFS } from "../about/-components/life-at-hfs";
import { BookYourFirstSession } from "./-components/book-your-first-session";
import { HeroSection } from "./-components/hero-section";
import { OurStory } from "./-components/our-story";
import { TakeFirstStep } from "./-components/take-first-step";
import { WhyWithUs } from "./-components/why-with-us";

export const Route = createFileRoute("/_layout/")({
	head: () => ({
		meta: [{ title: pageTitle("Home") }],
	}),
	component: Home,
});

function Home() {
	return (
		<div className="flex-1">
			<HeroSection />
			<WhyWithUs />
			{/* <IntroVideo /> */}
			<OurStory />
			<LifeAtHFS />
			<BookYourFirstSession />
			<TakeFirstStep />
		</div>
	);
}
