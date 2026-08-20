import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type React from "react";
import { CONTACT } from "#/lib/constants";
import { cn } from "#/lib/utils";

export const FindOurCourts: React.FC = () => {
	return (
		<section className="mx-auto flex max-w-360 flex-col gap-12 px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="flex flex-col items-start gap-6">
				<div className="flex items-center gap-2">
					<span className="relative flex size-2">
						<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
						<span className="relative size-2 rounded-full bg-primary" />
					</span>
					<p className="font-medium text-base">Pitches</p>
				</div>
				<div className="flex w-full flex-wrap justify-between gap-2 sm:gap-6">
					<h2 className="text-balance font-bold text-5xl leading-tight">
						FIND OUR PITCHES
					</h2>
					<p className="max-w-[28ch] text-pretty text-muted-foreground">
						Play across Allen, McKinney, Melissa, and Princeton.
					</p>
				</div>
			</div>

			<ul className="flex flex-col gap-6">
				{COURTS.map((court, index) => (
					<li key={court.id}>
						<CourtRow court={court} reverse={index % 2 === 1} />
					</li>
				))}
			</ul>
		</section>
	);
};

const CourtRow: React.FC<{
	court: (typeof COURTS)[number];
	reverse: boolean;
}> = ({ court, reverse }) => {
	return (
		<article className="grid gap-6 lg:grid-cols-2">
			<div
				className={cn(
					"flex flex-col justify-center gap-6 rounded-2xl bg-muted p-6 sm:p-8",
					reverse && "lg:order-2",
				)}
			>
				<h3 className="text-balance font-semibold text-2xl">{court.name}</h3>
				<ul className="flex flex-col gap-4">
					<li>
						<a
							href={court.mapUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-start gap-3 text-muted-foreground transition-colors duration-300 ease-out hover:text-primary"
						>
							<MapPinIcon
								aria-hidden
								className="mt-0.5 size-5 shrink-0 text-primary"
								strokeWidth={1.5}
							/>
							<span className="text-pretty">{court.address}</span>
						</a>
					</li>
					<li>
						<a
							href={`tel:${court.phoneHref}`}
							className="flex items-center gap-3 text-muted-foreground transition-colors duration-300 ease-out hover:text-primary"
						>
							<PhoneIcon
								aria-hidden
								className="size-5 shrink-0 text-primary"
								strokeWidth={1.5}
							/>
							{court.phone}
						</a>
					</li>
					<li>
						<a
							href={`mailto:${court.email}`}
							className="flex items-center gap-3 text-muted-foreground transition-colors duration-300 ease-out hover:text-primary"
						>
							<MailIcon
								aria-hidden
								className="size-5 shrink-0 text-primary"
								strokeWidth={1.5}
							/>
							{court.email}
						</a>
					</li>
				</ul>
			</div>
			<div className="min-h-64 overflow-hidden rounded-2xl outline outline-black/10 lg:min-h-80 dark:outline-white/10">
				<iframe
					title={`Map of ${court.name}`}
					src={court.embedUrl}
					className="size-full min-h-64 border-0 lg:min-h-80"
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
					allowFullScreen
				/>
			</div>
		</article>
	);
};

const COURTS = [
	{
		id: "allen",
		name: "Allen",
		address: "Allen, TX",
		phone: CONTACT.phone,
		phoneHref: CONTACT.phoneHref,
		email: CONTACT.email,
		mapUrl: "https://www.google.com/maps/search/?api=1&query=Allen%2C%20TX",
		embedUrl: "https://maps.google.com/maps?q=Allen,+TX&z=12&output=embed",
	},
	{
		id: "mckinney",
		name: "McKinney",
		address: "McKinney, TX",
		phone: CONTACT.phone,
		phoneHref: CONTACT.phoneHref,
		email: CONTACT.email,
		mapUrl: "https://www.google.com/maps/search/?api=1&query=McKinney%2C%20TX",
		embedUrl: "https://maps.google.com/maps?q=McKinney,+TX&z=12&output=embed",
	},
	{
		id: "melissa",
		name: "Melissa",
		address: "Melissa, TX",
		phone: CONTACT.phone,
		phoneHref: CONTACT.phoneHref,
		email: CONTACT.email,
		mapUrl: "https://www.google.com/maps/search/?api=1&query=Melissa%2C%20TX",
		embedUrl: "https://maps.google.com/maps?q=Melissa,+TX&z=12&output=embed",
	},
	{
		id: "princeton",
		name: "Princeton",
		address: "Princeton, TX",
		phone: CONTACT.phone,
		phoneHref: CONTACT.phoneHref,
		email: CONTACT.email,
		mapUrl: "https://www.google.com/maps/search/?api=1&query=Princeton%2C%20TX",
		embedUrl: "https://maps.google.com/maps?q=Princeton,+TX&z=12&output=embed",
	},
] as const;
