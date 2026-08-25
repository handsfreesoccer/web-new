import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import type React from "react";
import { toast } from "sonner";
import api from "#/api/http/xhr";
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
import { contactSchema } from "#/lib/contact-schema";

const SUBJECTS = [
	{ value: "classes", label: "Classes" },
	{ value: "schedules", label: "Schedules" },
	{ value: "enrollment", label: "Enrollment" },
	{ value: "private", label: "Private Coaching" },
	{ value: "other", label: "Other" },
] as const;
type ContactValues = {
	fullName: string;
	email: string;
	subject: (typeof SUBJECTS)[number]["value"];
	message: string;
};

export const MessageForm: React.FC = () => {
	const inquiryMutation = useMutation({
		mutationFn: (data: ContactValues) => api.post("/contact-inquiries", data),
	});
	const form = useForm({
		defaultValues: { fullName: "", email: "", subject: "classes", message: "" },
		onSubmit: async ({ value }) => {
			const parsed = contactSchema.safeParse(value);
			if (!parsed.success) {
				toast.error(
					parsed.error.issues[0]?.message ?? "Please complete the form.",
				);
				return;
			}
			try {
				const response = await inquiryMutation.mutateAsync(parsed.data);
				if (!response.data.success) {
					toast.error(
						response.data.errors?.[0] ??
							response.data.message ??
							"Inquiry could not be sent.",
					);
					return;
				}
				toast.success("Your inquiry has been received.");
				form.reset();
			} catch {
				toast.error("We could not send your inquiry right now.");
			}
		},
	});
	const error = (field: { state: { meta: { errors: unknown[] } } }) =>
		field.state.meta.errors[0] ? (
			<p className="text-destructive text-xs">
				{String(field.state.meta.errors[0])}
			</p>
		) : null;
	return (
		<section className="mx-auto flex max-w-360 flex-col gap-12 px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit();
				}}
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
					<form.Field name="fullName">
						{(field) => (
							<div className="flex flex-col gap-2">
								<Label htmlFor="fullName">Full Name</Label>
								<Input
									id="fullName"
									name="fullName"
									autoComplete="name"
									placeholder="Full Name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								{error(field)}
							</div>
						)}
					</form.Field>
					<form.Field name="email">
						{(field) => (
							<div className="flex flex-col gap-2">
								<Label htmlFor="contact-email">Email</Label>
								<Input
									id="contact-email"
									name="email"
									type="email"
									autoComplete="email"
									placeholder="Email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								{error(field)}
							</div>
						)}
					</form.Field>
					<form.Field name="subject">
						{(field) => (
							<div className="flex flex-col gap-2 sm:col-span-2">
								<Label htmlFor="subject">Subject</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(value as ContactValues["subject"])
									}
								>
									<SelectTrigger
										id="subject"
										className="h-10 w-full capitalize [&_svg]:text-secondary"
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
								{error(field)}
							</div>
						)}
					</form.Field>
					<form.Field name="message">
						{(field) => (
							<div className="flex flex-col gap-2 sm:col-span-2">
								<Label htmlFor="message">Message</Label>
								<Textarea
									id="message"
									name="message"
									placeholder="Message"
									rows={6}
									className="min-h-32"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								{error(field)}
							</div>
						)}
					</form.Field>
				</div>
				<Button
					type="submit"
					disabled={inquiryMutation.isPending}
					className="h-auto w-fit cursor-pointer gap-2 self-end rounded-full bg-primary p-1.5 pl-4 text-foreground hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
				>
					<p className="text-white">
						{inquiryMutation.isPending ? "Submitting..." : "Submit"}
					</p>
					<span className="grid size-11 place-content-center rounded-full bg-white">
						<ArrowRightIcon className="size-4 text-primary" />
					</span>
				</Button>
			</form>
		</section>
	);
};
