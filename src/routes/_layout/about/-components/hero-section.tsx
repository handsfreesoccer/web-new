import type React from "react";

export const HeroSection: React.FC = () => {
	return (
		<section className="mx-auto flex max-w-360 flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="flex w-full flex-col justify-between gap-11">
				<div className="flex flex-1 flex-col items-start gap-3">
					<h1 className="@container w-full font-bold text-5xl leading-tight sm:text-[min(4.5rem,calc(90cqi/11))]">
						ABOUT
					</h1>
					<div className="flex w-full flex-col flex-wrap justify-between gap-4 sm:flex-row sm:gap-8">
						<h2 className="font-light text-4xl text-muted-foreground sm:text-5xl">
							HANDSFREESOCCER ACADEMY
						</h2>
						<p className="text-muted-foreground sm:max-w-[30ch] sm:self-end">
							A place where passion for soccer grows into skill, confidence, and
							community.
						</p>
					</div>
				</div>
				<div className="relative flex h-80 flex-col justify-evenly gap-8 overflow-hidden rounded-3xl">
					<img
						src="https://placehold.co/600x480/black/black"
						alt="Hero Section"
						className="absolute h-full w-full object-cover"
					/>
				</div>
			</div>
		</section>
	);
};
