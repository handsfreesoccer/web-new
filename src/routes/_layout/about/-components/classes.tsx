import { Link } from "@tanstack/react-router";
import {
	ArrowRightIcon,
	CircleDotIcon,
	MailIcon,
	MapPinIcon,
	PhoneIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import type React from "react";
import { Button } from "#/components/ui/button";
import { BOOKING_SECTION_ID, CONTACT } from "#/lib/constants";

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
						alt="Kids training in a small group soccer session"
						className="h-full min-h-64 w-full rounded-2xl object-cover outline outline-black/10 dark:outline-white/10"
					/>
					<div className="flex flex-col gap-6">
						<p className="text-pretty font-medium text-2xl text-foreground leading-snug sm:text-3xl">
							Personalized 1:1 and small group soccer training for kids ages
							6–12.
						</p>
						<p className="text-pretty text-muted-foreground">
							Sessions focus on skill, fitness, and fun — built around each
							player's next step. We currently serve families in Allen,
							McKinney, Melissa, and Princeton.
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
						<li className="flex items-center sm:col-span-2 lg:col-span-2 lg:justify-end">
							<Button
								nativeButton={false}
								render={<Link hash={BOOKING_SECTION_ID} to="/" />}
								className="h-auto w-full gap-2 rounded-full p-1 pl-4 lg:w-fit"
							>
								<p>Book a Session</p>
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
		icon: UsersIcon,
		label: "Ages",
		value: "6–12",
	},
	{
		icon: CircleDotIcon,
		label: "Format",
		value: "1:1 & small group",
	},
	{
		icon: MapPinIcon,
		label: "Locations",
		value: "Allen, McKinney, Melissa & Princeton",
	},
	{
		icon: UserIcon,
		label: "Coach",
		value: "Omeiza Akerele",
	},
	{
		icon: PhoneIcon,
		label: "Phone",
		value: CONTACT.phone,
	},
	{
		icon: MailIcon,
		label: "Email",
		value: CONTACT.email,
	},
] as const;
