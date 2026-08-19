import { ArrowRightIcon } from "lucide-react";
import type React from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { DateTimePicker } from "#/components/ui-extended/date-time-picker";

const CLASSES = [
	{ value: "beginner", label: "Beginner" },
	{ value: "intermediate", label: "Intermediate" },
	{ value: "advanced", label: "Advanced" },
	{ value: "private", label: "Private Coaching" },
	{ value: "group", label: "Group Training" },
] as const;

const fieldClassName = "h-10";

export const BookYourFirstSession: React.FC = () => {
	return (
		<section className="relative mx-auto flex max-w-360 flex-col gap-12 px-4 py-8 sm:gap-16 sm:px-8 sm:py-16 md:px-16">
			<div className="relative grid w-full place-content-center overflow-hidden rounded-3xl p-4 sm:p-16">
				<img
					src="https://placehold.co/600x480/black/black"
					alt="Book Your First Session"
					className="absolute inset-0 size-full object-cover"
				/>
				<form className="relative flex w-full flex-col gap-8 rounded-2xl bg-white px-4 py-8 sm:max-w-fit sm:gap-12 sm:px-12 sm:py-12">
					<div className="flex flex-col gap-4 sm:gap-6">
						<h1 className="text-center font-bold text-3xl text-secondary sm:text-5xl">
							BOOK YOUR FIRST SESSION
						</h1>
						<p className="text-center text-muted-foreground text-sm sm:text-base">
							Reserve your spot today and start playing with confidence.
						</p>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input
								type="text"
								id="firstName"
								name="firstName"
								autoComplete="given-name"
								placeholder="e.g. Jordan"
								className={fieldClassName}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input
								type="text"
								id="lastName"
								name="lastName"
								autoComplete="family-name"
								placeholder="e.g. Mensah"
								className={fieldClassName}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								type="email"
								id="email"
								name="email"
								autoComplete="email"
								placeholder="e.g. jordan@email.com"
								className={fieldClassName}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="phone">Phone</Label>
							<Input
								type="tel"
								id="phone"
								name="phone"
								autoComplete="tel"
								placeholder="e.g. (555) 123-4567"
								className={fieldClassName}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="class">Select Class</Label>
							<Select name="class" id="class">
								<SelectTrigger
									className={`${fieldClassName} w-full capitalize [&_svg]:text-secondary`}
								>
									<SelectValue placeholder="e.g. Beginner" />
								</SelectTrigger>
								<SelectContent align="start" alignItemWithTrigger={false}>
									{CLASSES.map((sessionClass) => (
										<SelectItem
											key={sessionClass.value}
											value={sessionClass.value}
										>
											{sessionClass.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="preferredDateTime">Preferred Date & Time</Label>
							<DateTimePicker
								id="preferredDateTime"
								name="preferredDateTime"
								from={new Date()}
								placeholder="e.g. 09/12/2026 04:00 PM – 06:00 PM"
								minuteStep={30}
							/>
						</div>
					</div>
					<Button
						type="submit"
						className="h-auto w-fit cursor-pointer gap-2 self-end rounded-full bg-primary p-1.5 pl-4 text-foreground hover:bg-primary"
					>
						<p className="text-white">Book Your Session</p>
						<span className="grid size-11 place-content-center rounded-full bg-white">
							<ArrowRightIcon className="size-4 text-primary" />
						</span>
					</Button>
				</form>
			</div>
		</section>
	);
};
