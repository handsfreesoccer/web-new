import { ArrowLeftIcon, ArrowRightIcon, StarIcon } from "lucide-react";
import type React from "react";
import { QuoteIcon } from "#/components/icons/quote-icon";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

export const Testimonial: React.FC = () => {
	return (
		<section className="mx-auto flex max-w-360 flex-col gap-16 px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="flex w-full flex-col justify-between gap-10">
				<div className="flex flex-1 flex-col items-start gap-6">
					<div className="flex items-center gap-2">
						<span className="relative flex size-2">
							<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
							<span className="relative size-2 rounded-full bg-primary" />
						</span>
						<p className="font-medium text-base">Value</p>
					</div>
					<div className="flex w-full flex-1 justify-between gap-6">
						<h2 className="font-bold text-5xl leading-tight">
							WHAT PLAYERS SAY
						</h2>

						<p className="max-w-[35ch] text-muted-foreground">
							See how bouncy helps players build skills and confidence.
						</p>
					</div>
					<div className="flex w-full flex-col gap-6">
						<ul className="flex items-stretch gap-4">
							{TESTIMONIALS.map((testimonial) => (
								<TestimonialCard
									key={testimonial.name}
									testimonial={testimonial}
								/>
							))}
						</ul>
						<div className="flex items-center justify-end gap-2">
							<Button
								className="size-14 cursor-pointer rounded-full p-0"
								variant="outline"
							>
								<ArrowLeftIcon className="size-5" />
							</Button>
							<Button className="size-14 cursor-pointer rounded-full p-0">
								<ArrowRightIcon className="size-5" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

const TestimonialCard: React.FC<{
	testimonial: (typeof TESTIMONIALS)[number];
}> = ({ testimonial }) => {
	return (
		<div className="flex max-w-90 flex-col gap-10 rounded-xl bg-primary/30 px-6 py-8">
			<div className="flex items-start justify-between gap-16">
				<QuoteIcon
					className="*:fill-muted-foreground *:stroke-muted-foreground"
					size={56}
				/>
				<ul className="flex items-center gap-1">
					{[1, 2, 3, 4, 5].map((item) => (
						<li key={`${testimonial.name}-${item}`}>
							<StarIcon
								className={cn(
									"size-5 text-muted-foreground",
									item <= testimonial.rating
										? "fill-primary text-primary"
										: "fill-muted-foreground/50 text-muted-foreground/50",
								)}
							/>
						</li>
					))}
				</ul>
			</div>
			<p className="text-muted-foreground">{testimonial.body}</p>
			<div className="flex items-center gap-2">
				<img
					src={testimonial.profileUrl}
					alt={testimonial.name}
					className="size-10 rounded-full"
				/>
				<div className="flex flex-col">
					<p className="font-medium text-base">{testimonial.name}</p>
					<p className="text-muted-foreground text-sm">{testimonial.class}</p>
				</div>
			</div>
		</div>
	);
};

const TESTIMONIALS = [
	{
		rating: 5,
		profileUrl: "/images/home/testimonials/james-grant.png",
		name: "James Grant",
		class: "College Student",
		body: "Bouncy made me fall in love with tennis! The coaches are patient and motivating, and the classes are always fun.",
	},
	{
		rating: 3,
		profileUrl: "/images/home/testimonials/kale-maison.png",
		name: "Kale Maison",
		class: "Marketing Professional",
		body: "The perfect place to start and grow. I improved my technique and also made great friends on the court.",
	},
	{
		rating: 4,
		profileUrl: "/images/home/testimonials/vera-winsley.png",
		name: "Vera Winsley",
		class: "Software Engineer",
		body: "Their private coaching program boosted my confidence. I even joined my first tournament last year thanks to Bouncy.",
	},
];
