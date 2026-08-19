import { createFileRoute } from "@tanstack/react-router";
import { FindOurCourts } from "./-components/find-our-courts";
import { HeroSection } from "./-components/hero-section";
import { MessageForm } from "./-components/message-form";

export const Route = createFileRoute("/_layout/contact-us")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex-1">
			<HeroSection />
			<MessageForm />
			<FindOurCourts />
		</div>
	);
}
