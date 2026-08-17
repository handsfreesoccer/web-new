import React from "react";

export const OurStory: React.FC = () => {
	return (
		<section className="max-w-360 mx-auto px-4 py-8 sm:py-16 sm:px-8 md:px-16 flex flex-col gap-16">
			<div className="flex gap-6 flex-1 flex-col items-start">
				<div className="flex items-center gap-2">
					<span className="relative flex size-2">
						<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
						<span className="relative size-2 rounded-full bg-primary" />
					</span>
					<p className="font-medium text-base">Our Story</p>
				</div>
				<div className="flex flex-col w-full gap-12">
					<h2 className="text-5xl font-bold leading-tight w-1/2">
						HOW WE BEGAN
					</h2>
					<p className="text-muted-foreground text-3xl max-w-[60%] self-end font-light leading-tight">
						With a strong belief in community-driven sports, we built a program
						that welcomes beginners and nurtures aspiring champions.
					</p>
				</div>
			</div>
		</section>
	);
};
