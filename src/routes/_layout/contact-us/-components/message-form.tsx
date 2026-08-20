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
import { Textarea } from "#/components/ui/textarea";
import { CONTACT } from "#/lib/constants";

const SUBJECTS = [
	{ value: "classes", label: "Classes" },
	{ value: "schedules", label: "Schedules" },
	{ value: "enrollment", label: "Enrollment" },
	{ value: "private", label: "Private Coaching" },
	{ value: "other", label: "Other" },
] as const;

const fieldClassName = "h-10";

export const MessageForm: React.FC = () => {
	return (
		<section className="mx-auto flex max-w-360 flex-col gap-12 px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<form
				action={`mailto:${CONTACT.email}`}
				method="post"
				encType="text/plain"
				className="flex w-full flex-col gap-8 sm:gap-12"
			>
				<div className="flex flex-col items-start gap-6">
					<div className="flex items-center gap-2">
						<span className="relative flex size-2">
							<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
							<span className="relative size-2 rounded-full bg-primary" />
						</span>
						<p className="font-medium text-base">Message Form</p>
					</div>
					<div className="flex flex-col gap-4">
						<h2 className="text-balance font-bold text-5xl leading-tight">
							SEND A QUICK INQUIRY
						</h2>
						<p className="max-w-[40ch] text-pretty text-muted-foreground">
							Tell us what you need, and we'll reply as soon as possible.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="flex flex-col gap-2">
						<Label htmlFor="fullName">Full Name</Label>
						<Input
							type="text"
							id="fullName"
							name="fullName"
							autoComplete="name"
							placeholder="Full Name"
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
							placeholder="Email"
							className={fieldClassName}
						/>
					</div>
					<div className="flex flex-col gap-2 sm:col-span-2">
						<Label htmlFor="subject">Subject</Label>
						<Select name="subject" id="subject">
							<SelectTrigger
								className={`${fieldClassName} w-full [&_svg]:text-secondary`}
							>
								<SelectValue placeholder="Subject" />
							</SelectTrigger>
							<SelectContent align="start" alignItemWithTrigger={false}>
								{SUBJECTS.map((subject) => (
									<SelectItem key={subject.value} value={subject.value}>
										{subject.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2 sm:col-span-2">
						<Label htmlFor="message">Message</Label>
						<Textarea
							id="message"
							name="message"
							placeholder="Message"
							rows={6}
							className="min-h-32"
						/>
					</div>
				</div>

				<Button
					type="submit"
					className="h-auto w-fit cursor-pointer gap-2 self-end rounded-full bg-primary p-1.5 pl-4 text-foreground hover:bg-primary"
				>
					<p className="text-white">Submit</p>
					<span className="grid size-11 place-content-center rounded-full bg-white">
						<ArrowRightIcon className="size-4 text-primary" />
					</span>
				</Button>
			</form>
		</section>
	);
};
