import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "./-components/hero-section";
import { WhyWithUs } from "./-components/why-with-us";
import { IntroVideo } from "./-components/intro-video";

export const Route = createFileRoute("/_layout/")({ component: Home });

function Home() {
	return (
		<div className="flex-1">
			<HeroSection />
			<WhyWithUs />
			<IntroVideo />
		</div>
	);
}
