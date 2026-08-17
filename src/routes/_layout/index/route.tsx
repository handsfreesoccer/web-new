import { createFileRoute } from "@tanstack/react-router";
import { BookYourFirstSession } from "./-components/book-your-first-session";
import { HeroSection } from "./-components/hero-section";
import { IntroVideo } from "./-components/intro-video";
import { OurStory } from "./-components/our-story";
import { WhyWithUs } from "./-components/why-with-us";

export const Route = createFileRoute("/_layout/")({ component: Home });

function Home() {
	return (
		<div className="flex-1">
			<HeroSection />
			<WhyWithUs />
			<IntroVideo />
			<OurStory />
			<BookYourFirstSession />
		</div>
	);
}
