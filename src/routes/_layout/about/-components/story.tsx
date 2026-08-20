import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import type React from "react";
import { Button } from "#/components/ui/button";
import { BOOKING_SECTION_ID } from "#/lib/constants";

export const Story: React.FC = () => {
	return (
		<section className="mx-auto flex max-w-360 flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="flex w-full flex-col gap-8 lg:flex-row">
				<div className="flex flex-1 flex-col justify-between gap-12 self-stretch rounded-2xl bg-primary p-6">
					<div className="text-white">
						<p className="font-medium text-4xl">50+</p>
						<p className="font-light text-sm">Young Athletes Training</p>
					</div>
				</div>
				<div className="flex flex-col items-start gap-6 lg:max-w-[67%] xl:max-w-[75%]">
					<div className="flex items-center gap-2">
						<span className="relative flex size-2">
							<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
							<span className="relative size-2 rounded-full bg-primary" />
						</span>
						<p className="font-medium text-base">Story</p>
					</div>
					<div className="flex flex-col gap-10">
						<p className="font-light text-2xl sm:text-3xl">
							HandsFree Soccer Academy was founded by Coach Omeiza, whose own
							soccer journey began on the streets of Nigeria. What started as a
							small training program has grown into a community of 50+ young
							athletes across the Dallas–Fort Worth area.
						</p>
						<div className="flex flex-wrap items-center justify-between gap-4 text-sm sm:flex-nowrap sm:gap-8 sm:text-base">
							<p>
								Every lesson is designed to balance skill, fitness, and fun —
								our mission is simple: grow the love of soccer, one player at a
								time.
							</p>
							<Button
								nativeButton={false}
								render={<Link hash={BOOKING_SECTION_ID} to="/" />}
								className="h-auto w-fit gap-2 rounded-full p-1 pl-4"
							>
								<p>Get Started Now</p>
								<span className="grid size-11 place-content-center rounded-full bg-white">
									<ArrowRightIcon className="size-4 text-primary" />
								</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
