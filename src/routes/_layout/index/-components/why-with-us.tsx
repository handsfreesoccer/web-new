import type React from "react";

const WHY_WITH_US_VALUES = [
	{
		title: "Fitness Training",
		description:
			"We offer fitness training programs tailored to your child's needs and goals.",
	},
	{
		title: "Personalized Coaching",
		description:
			"One-on-one and group sessions with tailored strategies that focus on each player's strengths and weaknesses.",
	},
	{
		title: "Core Skill Development",
		description:
			"In-depth training in dribbling, passing, shooting, and tactical awareness for real game success.",
	},
	{
		title: "All Skill Levels",
		description:
			"Programs for beginners through advanced players, so every athlete can reach their full potential.",
	},
] as const;

export const WhyWithUs: React.FC = () => {
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
					<div className="flex flex-1 justify-between gap-6">
						<h2 className="w-1/2 font-bold text-5xl leading-tight">
							WHY WITH US
						</h2>

						<p className="w-1/2 text-muted-foreground">
							Soccer is a game of skill, strategy, and teamwork. It is a sport
							that requires physical fitness, agility, and quick
							decision-making.
						</p>
					</div>
				</div>

				<div className="flex w-full flex-col justify-between gap-10 lg:flex-row">
					<div className="flex flex-1 flex-col gap-8 self-stretch">
						<div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-5 md:gap-6">
							<div className="relative overflow-hidden rounded-3xl sm:row-span-5 sm:min-h-0">
								<img
									src="https://placehold.co/320/black/black"
									alt="Player walking on the court"
									className="absolute inset-0 size-full object-cover outline-1 outline-black/10"
								/>
							</div>
							<div className="row-span-2 flex flex-col items-start justify-center rounded-3xl bg-primary px-8 py-10">
								<p className="font-semibold text-5xl text-white md:text-6xl">
									95%
								</p>
								<p className="font-medium text-base text-white">
									Students Satisfaction
								</p>
							</div>
							<div className="relative row-span-3 min-h-40 overflow-hidden rounded-3xl sm:min-h-0">
								<img
									src="https://placehold.co/600x480/green/green"
									alt="Tennis ball on the court line"
									className="absolute inset-0 size-full object-cover outline-1 outline-black/10"
								/>
							</div>
						</div>
					</div>
					<div className="flex-1">
						<ul className="flex flex-col justify-between gap-8">
							{WHY_WITH_US_VALUES.map((value, index) => (
								<li key={value.title} className="flex items-start gap-8">
									<p className="pt-1.5 font-semibold text-3xl text-primary tabular-nums">
										{String(index + 1).padStart(2, "0")}
									</p>
									<div>
										<p className="font-medium text-xl">{value.title}</p>
										<p className="text-muted-foreground">{value.description}</p>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
};
