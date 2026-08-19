import type React from "react";

export const CoreValues: React.FC = () => {
	return (
		<section className="mx-auto flex flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="flex w-full max-w-360 flex-col justify-between gap-12">
				<div className="flex flex-1 flex-col items-start gap-6">
					<div className="flex items-center gap-2">
						<span className="relative flex size-2">
							<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
							<span className="relative size-2 rounded-full bg-primary" />
						</span>
						<p className="font-medium text-base">Core Values</p>
					</div>
					<div className="flex w-full flex-1 flex-wrap justify-between gap-2 sm:gap-6">
						<h2 className="text-balance font-bold text-5xl leading-tight">
							OUR CORE VALUES
						</h2>

						<p className="max-w-[25ch] text-pretty text-muted-foreground">
							Powering every breakthrough, from the first lesson to the final
							trophy.
						</p>
					</div>
				</div>

				<CoreValueCarousel />
			</div>
		</section>
	);
};

const CoreValueCarousel: React.FC = () => {
	return (
		<div className="flex w-full flex-col gap-6">
			<div className="@container w-full">
				<ul className="flex flex-wrap items-stretch gap-6 will-change-transform">
					{VALUES.map((value) => (
						<li
							className="group relative flex h-90 flex-[0.6] flex-col gap-4 overflow-hidden rounded-xl bg-muted p-6 duration-300 ease-in-out hover:flex-1"
							key={value.number}
						>
							<img
								src="https://placehold.co/600x400/black/white"
								alt=""
								className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100"
							/>
							<div className="relative flex flex-1 flex-col justify-between gap-4">
								<h3 className="w-full text-balance text-left font-bold text-6xl text-muted-foreground leading-tight duration-300 ease-in-out group-hover:text-4xl">
									{value.number}
								</h3>
								<div className="flex flex-col gap-2 text-left">
									<p className="text-pretty font-semibold text-4xl text-primary duration-300 ease-in-out group-hover:text-white">
										{value.title}
									</p>
									<p className="text-pretty text-muted-foreground duration-300 ease-in-out group-hover:text-white">
										{value.body}
									</p>
								</div>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

const VALUES = [
	{
		number: "01",
		title: "DISCIPLINE",
		body: "Strong fundamentals come from consistent practice.",
	},
	{
		number: "02",
		title: "PASSION",
		body: "We teach with energy and genuine love for tennis.",
	},
	{
		number: "03",
		title: "GROWTH",
		body: "Every player progresses at their own pace, with clear guidance.",
	},
	{
		number: "04",
		title: "COMMUNITY",
		body: "We build connections that last beyond the court.",
	},
];
