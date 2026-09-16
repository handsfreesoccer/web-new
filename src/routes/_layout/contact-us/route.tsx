import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, pageTitle } from "#/lib/site-meta";
import { LifeAtHFS } from "../about/-components/life-at-hfs";
import { Faq } from "./-components/faq";
import { FindOurCourts } from "./-components/find-our-courts";
import { HeroSection } from "./-components/hero-section";
import { MessageForm } from "./-components/message-form";

export const Route = createFileRoute("/_layout/contact-us")({
	head: () => ({
		meta: pageMeta({
			title: pageTitle("Contact Us"),
			description:
				"Reach HandsFree Soccer Academy for classes, schedules, enrollment, and private coaching in Allen, McKinney, Melissa, and Princeton.",
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex-1">
			<HeroSection />
			<MessageForm />
			<FindOurCourts />
			<LifeAtHFS />
			<Faq />
		</div>
	);
}
