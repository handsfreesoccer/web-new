import { Button } from "#/components/ui/button";
import React from "react";

export const OurStory: React.FC = () => {
	return (
		<section className="max-w-360 mx-auto px-4 py-8 sm:py-16 sm:px-8 md:px-16 flex flex-col gap-12 sm:gap-16">
			<div className="flex gap-6 flex-1 flex-col items-start">
				<div className="flex items-center gap-2">
					<span className="relative flex size-2">
						<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
						<span className="relative size-2 rounded-full bg-primary" />
					</span>
					<p className="font-medium text-base">Our Story</p>
				</div>
				<div className="flex flex-col w-full gap-8 sm:gap-12">
					<h2 className="text-5xl font-bold leading-tight sm:w-1/2">
						HOW WE BEGAN
					</h2>
					<p className="text-muted-foreground text-xl sm:text-2xl md:text-3xl max-w-full sm:max-w-[60%] self-end font-light leading-tight">
						With a strong belief in community-driven sports, we built a program
						that welcomes beginners and nurtures aspiring champions.
					</p>
				</div>
			</div>
			<div className="flex w-full gap-8 lg:gap-10 justify-between flex-col lg:flex-row">
				<div className="grid grid-cols-2 md:grid-cols-7 h-40 w-full gap-8 lg:max-w-[35%]">
					<div className="col-span-1 md:col-span-3 h-full relative rounded-2xl overflow-hidden">
						<img
							src="https://placehold.co/320/black/black"
							alt="Player walking on the court"
							className="absolute inset-0 size-full object-cover outline-1 outline-black/10"
						/>
					</div>
					<div className="col-span-1 md:col-span-4 h-full relative rounded-2xl overflow-hidden">
						<img
							src="https://placehold.co/320/green/green"
							alt="Player walking on the court"
							className="absolute inset-0 size-full object-cover outline-1 outline-black/10"
						/>
					</div>
				</div>
				<div className="flex justify-between gap-10 lg:max-w-6/10 items-end flex-col sm:flex-row">
					<p className="text-muted-foreground text-base font-light leading-tight md:max-w-5/10">
						Every lesson is designed to balance skill, fitness, and fun. Our
						mission is simple: to grow the love of tennis, one player at a time.
					</p>
					<Button className="px-6 py-6 rounded-full w-full sm:w-auto">
						Start Your Journey
					</Button>
				</div>
			</div>
		</section>
	);
};
