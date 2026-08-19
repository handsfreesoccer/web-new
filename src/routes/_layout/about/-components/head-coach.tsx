import type React from "react";

export const HeadCoach: React.FC = () => {
	return (
		<section className="mx-auto flex flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="flex w-full max-w-360 flex-col gap-12">
				<div className="flex flex-col items-start gap-6">
					<div className="flex items-center gap-2">
						<span className="relative flex size-2">
							<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
							<span className="relative size-2 rounded-full bg-primary" />
						</span>
						<p className="font-medium text-base text-muted-foreground">
							Head Coach
						</p>
					</div>
					<h2 className="text-balance font-bold text-5xl leading-tight">
						OMEIZA AKERELE
					</h2>
				</div>

				<div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
					<img
						src="https://placehold.co/800x600/black/white?text=Coach"
						alt="Head coach Omeiza Akerele"
						className="min-h-80 w-full self-stretch rounded-2xl object-cover outline outline-black/10 dark:outline-white/10"
					/>
					<div className="flex flex-col gap-6">
						<p className="text-pretty font-medium text-2xl text-foreground capitalize leading-snug sm:text-3xl">
							A Welcome Message From The Head Coach
						</p>
						<p className="text-pretty text-muted-foreground">
							Omeiza Akerele leads HandsFreeSoccer Academy with a simple belief:
							great athletes are developed, not rushed. He brings years of
							on-court experience, a clear training philosophy, and a focus on
							fundamentals that last. From first-time players to competitive
							athletes, he shapes sessions that are demanding, supportive, and
							built around each player&apos;s next step.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};
