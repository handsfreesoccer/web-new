import { Link } from "@tanstack/react-router";
import {
	ArrowRightIcon,
	CalendarIcon,
	CircleDotIcon,
	ClockIcon,
	HourglassIcon,
	RefreshCwIcon,
	TrophyIcon,
	UserIcon,
} from "lucide-react";
import type React from "react";
import { Button } from "#/components/ui/button";

export const Classes: React.FC = () => {
	return (
		<section className="mx-auto flex flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="flex w-full max-w-360 flex-col gap-12">
				<div className="flex flex-col items-start gap-6">
					<div className="flex items-center gap-2">
						<span className="relative flex size-2">
							<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
							<span className="relative size-2 rounded-full bg-primary" />
						</span>
						<p className="font-medium text-base text-muted-foreground">About</p>
					</div>
					<h2 className="text-balance font-bold text-5xl leading-tight">
						LEVEL UP YOUR MATCH GAME
					</h2>
				</div>

				<div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
					<img
						src="https://placehold.co/800x600/black/white?text=Class"
						alt="Player shooting during competitive training"
						className="h-full min-h-64 w-full rounded-2xl object-cover outline outline-black/10 dark:outline-white/10"
					/>
					<div className="flex flex-col gap-6">
						<p className="text-pretty font-medium text-2xl text-foreground leading-snug sm:text-3xl">
							Competitive Training is designed for players ready to move beyond
							the basics and raise their overall level.
						</p>
						<p className="text-pretty text-muted-foreground">
							This program focuses on advanced techniques, match strategy,
							mental toughness, and physical conditioning. Each session
							simulates real match scenarios to prepare players for competitive
							play, tournaments, and long-term performance growth.
						</p>
					</div>
				</div>

				<div className="rounded-2xl bg-muted p-6 sm:p-8 lg:p-10">
					<ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
						{CLASS_DETAILS.map((detail) => (
							<li key={detail.label} className="flex items-start gap-3">
								<detail.icon
									aria-hidden
									className="mt-0.5 size-5 shrink-0 text-primary"
									strokeWidth={1.5}
								/>
								<div className="flex min-w-0 flex-col gap-1">
									<p className="text-muted-foreground text-xs uppercase tracking-wide">
										{detail.label}
									</p>
									<p className="text-pretty font-semibold text-primary">
										{detail.value}
									</p>
								</div>
							</li>
						))}
						<li className="flex items-center sm:col-span-2 lg:col-span-1 lg:justify-end">
							<Button
								nativeButton={false}
								render={<Link to={"/join" as never} />}
								className="h-auto w-full gap-2 rounded-full p-1 pl-4 lg:w-fit"
							>
								<p>Join This Class Now</p>
								<span className="grid size-11 place-content-center rounded-full bg-white">
									<ArrowRightIcon className="size-4 text-primary" />
								</span>
							</Button>
						</li>
					</ul>
				</div>
			</div>
		</section>
	);
};

const CLASS_DETAILS = [
	{
		icon: TrophyIcon,
		label: "Level",
		value: "Advanced",
	},
	{
		icon: CalendarIcon,
		label: "Days",
		value: "Tuesday & Thursday",
	},
	{
		icon: RefreshCwIcon,
		label: "Number of Classes",
		value: "2 Classes / Week",
	},
	{
		icon: ClockIcon,
		label: "Times",
		value: "6PM - 8PM",
	},
	{
		icon: HourglassIcon,
		label: "Duration",
		value: "6 Months",
	},
	{
		icon: UserIcon,
		label: "Coaches",
		value: "Daniel Rivera",
	},
	{
		icon: CircleDotIcon,
		label: "Class Availability",
		value: "4 spots left",
	},
] as const;
