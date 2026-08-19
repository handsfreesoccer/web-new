import type React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "#/components/ui/accordion";

export const Faq: React.FC = () => {
	return (
		<section className="mx-auto flex max-w-360 flex-col gap-12 px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="grid w-full gap-10 lg:grid-cols-2 lg:gap-16">
				<div className="flex flex-col items-start gap-6">
					<div className="flex items-center gap-2">
						<span className="relative flex size-2">
							<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
							<span className="relative size-2 rounded-full bg-primary" />
						</span>
						<p className="font-medium text-base">FAQ</p>
					</div>
					<div className="flex flex-col gap-4">
						<h2 className="text-balance font-bold text-5xl leading-tight">
							LET'S CLEAR THINGS UP
						</h2>
						<p className="max-w-[32ch] text-pretty text-muted-foreground">
							Get guidance on schedules, plans, and training options.
						</p>
					</div>
				</div>

				<Accordion
					defaultValue={["gear"]}
					className="gap-4 overflow-visible rounded-none border-0"
				>
					{FAQS.map((faq) => (
						<AccordionItem
							key={faq.id}
							value={faq.id}
							className="rounded-2xl border-0 not-last:border-0 bg-muted data-open:bg-primary data-open:text-primary-foreground"
						>
							<AccordionTrigger className="p-6 font-medium text-base hover:no-underline **:data-[slot=accordion-trigger-icon]:text-current">
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className="text-pretty px-6 pb-6 text-primary-foreground/90">
								{faq.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
};

const FAQS = [
	{
		id: "book-session",
		question: "How do I book my first session?",
		answer:
			"Fill out the inquiry form on this page or book a session from the home page. We'll confirm your spot by email and share everything you need for day one.",
	},
	{
		id: "gear",
		question: "Do I need to bring my own boots and soccer gear to join?",
		answer:
			"Basic equipment is available for beginners, and you're welcome to bring your own anytime.",
	},
	{
		id: "switch-class",
		question:
			"If my schedule changes, can I switch to a different class later?",
		answer:
			"Yes. If space is available, we can move you to another class. Reach out and we'll help you find a time that fits.",
	},
	{
		id: "kids-adults",
		question: "Are there classes for kids and adults?",
		answer:
			"Yes. We run programs for kids, teens, and adults, from first-time players through competitive training.",
	},
] as const;
