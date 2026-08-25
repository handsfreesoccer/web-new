import { Link } from "@tanstack/react-router";
import type React from "react";
import { Button } from "#/components/ui/button";
import { useSiteAssetUrl } from "#/hooks/use-media";
import { BOOKING_SECTION_ID } from "#/lib/constants";

export const OurStory: React.FC = () => {
	const storyLeft = useSiteAssetUrl(
		"home",
		"story-left",
		"https://placehold.co/320/black/black",
	);
	const storyRight = useSiteAssetUrl(
		"home",
		"story-right",
		"https://placehold.co/320/black/black",
	);

	return (
		<section className="mx-auto flex max-w-360 flex-col gap-12 px-4 py-8 sm:gap-16 sm:px-8 sm:py-16 md:px-16">
			<div className="flex flex-1 flex-col items-start gap-6">
				<div className="flex items-center gap-2">
					<span className="relative flex size-2">
						<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
						<span className="relative size-2 rounded-full bg-primary" />
					</span>
					<p className="font-medium text-base">Our Story</p>
				</div>
				<div className="flex w-full flex-col gap-8 sm:gap-12">
					<h2 className="font-bold text-5xl leading-tight sm:w-1/2">
						HOW WE BEGAN
					</h2>
					<p className="max-w-full self-end font-light text-muted-foreground text-xl leading-tight sm:max-w-[60%] sm:text-2xl md:text-3xl">
						HandsFree Soccer Academy was founded by Coach Omeiza, whose own
						soccer journey began on the streets of Nigeria. What started as a
						small training program has grown into a community of 50+ young
						athletes across the Dallas–Fort Worth area.
					</p>
				</div>
			</div>
			<div className="flex w-full flex-col justify-between gap-8 lg:flex-row lg:gap-10">
				<div className="grid h-40 w-full grid-cols-2 gap-8 md:grid-cols-7 lg:max-w-[35%]">
					<div className="relative col-span-1 h-full overflow-hidden rounded-2xl md:col-span-4">
						<img
							src="/images/stock/stock-5.webp"
							alt="Player walking on the pitch"
							className="absolute inset-0 size-full object-cover outline-1 outline-black/10"
						/>
					</div>
					<div className="relative col-span-1 h-full overflow-hidden rounded-2xl md:col-span-3">
						<img
							src="/images/stock/stock-6.webp"
							alt="Player walking on the pitch"
							className="absolute inset-0 size-full object-cover outline-1 outline-black/10"
						/>
					</div>
				</div>
				<div className="flex flex-col items-end justify-between gap-10 sm:flex-row lg:max-w-6/10">
					<p className="font-light text-base text-muted-foreground leading-tight md:max-w-5/10">
						Every lesson is designed to balance skill, fitness, and fun. Our
						mission is simple: to grow the love of soccer, one player at a time.
					</p>
					<Button
						nativeButton={false}
						render={<Link hash={BOOKING_SECTION_ID} to="/" />}
						className="w-full rounded-full px-6 py-6 sm:w-auto"
					>
						Start Your Journey
					</Button>
				</div>
			</div>
		</section>
	);
};
