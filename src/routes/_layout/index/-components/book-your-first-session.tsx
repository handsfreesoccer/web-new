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
import {
	DateTimePicker,
	type DateTimeRange,
	type MinuteStep,
} from "#/components/ui-extended/date-time-picker";
import { startOfDay } from "date-fns";
import { useMemo } from "react";
import { useBookingAvailability } from "#/hooks/use-booking-availability";
import { bookingSchema } from "#/lib/booking-schema";
import {
	getBookingWindow,
	timeStringToDate,
	validateBookingAppointment,
	weekdaysToIndices,
} from "#/lib/booking-availability-schema";
import { BOOKING_SECTION_ID } from "#/lib/constants";
import { useHashScroll } from "#/lib/use-hash-scroll";

const CLASSES = [
	{ value: "beginner", label: "Beginner" },
	{ value: "intermediate", label: "Intermediate" },
	{ value: "one-on-one", label: "1:1 Coaching" },
	{ value: "biweekly-saturday", label: "Biweekly Saturday Intensive" },
] as const;
type FormValues = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	classType: (typeof CLASSES)[number]["value"];
	appointment: DateTimeRange;
};
const fieldClassName = "h-10";

export const BookYourFirstSession: React.FC = () => {
	useHashScroll(BOOKING_SECTION_ID);
	const {
		data: availability,
		isLoading: isAvailabilityLoading,
		isFetching: isAvailabilityFetching,
	} = useBookingAvailability();
	const isLoadingAvailability = isAvailabilityLoading || isAvailabilityFetching;
	const bookingWindow = useMemo(
		() => (availability ? getBookingWindow(availability) : null),
		[availability],
	);
	const calendarFrom = useMemo(() => {
		const today = startOfDay(new Date());
		if (!bookingWindow) return today;
		const earliestDay = startOfDay(bookingWindow.earliest);
		return earliestDay > today ? earliestDay : today;
	}, [bookingWindow]);
	const calendarTo = useMemo(() => {
		if (!bookingWindow) return undefined;
		return bookingWindow.latestDay;
	}, [bookingWindow]);
	const bookingMutation = useMutation({
		mutationFn: (data: Record<string, unknown>) => api.post("/bookings", data),
	});
	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			classType: "beginner",
			appointment: {},
		},
		onSubmit: async ({ value }) => {
			const typedValue = value as FormValues;
			const appointmentError = validateBookingAppointment(
				typedValue.appointment,
				availability,
			);
			if (appointmentError) {
				toast.error(appointmentError);
				return;
			}
			const parsed = bookingSchema.safeParse({
				...typedValue,
				appointmentStart: typedValue.appointment.from,
				appointmentEnd: typedValue.appointment.to,
			});
			if (!parsed.success) {
				toast.error(
					parsed.error.issues[0]?.message ?? "Please complete the form.",
				);
				return;
			}
			try {
				const response = await bookingMutation.mutateAsync({
					...parsed.data,
					appointmentStart: parsed.data.appointmentStart.toISOString(),
					appointmentEnd: parsed.data.appointmentEnd?.toISOString(),
				});
				if (!response.data.success) {
					toast.error(
						response.data.errors?.[0] ??
							response.data.message ??
							"Booking could not be submitted.",
					);
					return;
				}
				toast.success("Your booking information has been submitted.");
				form.reset();
			} catch {
				toast.error("We could not save your booking right now.");
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
		<section
			id={BOOKING_SECTION_ID}
			className="relative mx-auto flex max-w-360 scroll-mt-28 flex-col gap-12 px-4 py-8 sm:gap-16 sm:px-8 sm:py-16 md:px-16"
		>
			<div className="relative grid w-full place-content-center overflow-hidden rounded-3xl p-4 sm:p-16">
				<img
					src="/images/stock/stock-3.webp"
					alt="Book Your First Session"
					className="absolute inset-0 size-full object-cover"
				/>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						void form.handleSubmit();
					}}
					className="relative flex w-full flex-col gap-8 rounded-2xl bg-white px-4 py-8 sm:max-w-fit sm:gap-12 sm:px-12 sm:py-12"
				>
					<div className="flex flex-col gap-4 sm:gap-6">
						<h1 className="text-center font-bold text-3xl text-secondary sm:text-5xl">
							BOOK YOUR FIRST SESSION
						</h1>
						<p className="text-center text-muted-foreground text-sm sm:text-base">
							Reserve your spot today and start playing with confidence.
						</p>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{(["firstName", "lastName", "email", "phone"] as const).map(
							(name) => (
								<form.Field key={name} name={name}>
									{(field) => (
										<div className="flex flex-col gap-2">
											<Label htmlFor={name}>
												{name === "firstName"
													? "First Name"
													: name === "lastName"
														? "Last Name"
														: name[0]?.toUpperCase() + name.slice(1)}
											</Label>
											<Input
												id={name}
												type={
													name === "email"
														? "email"
														: name === "phone"
															? "tel"
															: "text"
												}
												autoComplete={
													name === "firstName"
														? "given-name"
														: name === "lastName"
															? "family-name"
															: name
												}
												placeholder={
													name === "firstName"
														? "e.g. Jordan"
														: name === "lastName"
															? "e.g. Mensah"
															: name === "email"
																? "e.g. jordan@email.com"
																: "e.g. (555) 123-4567"
												}
												className={fieldClassName}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
											{error(field)}
										</div>
									)}
								</form.Field>
							),
						)}
						<form.Field name="classType">
							{(field) => (
								<div className="flex flex-col gap-2">
									<Label htmlFor="classType">Select Class</Label>
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as FormValues["classType"])
										}
									>
										<SelectTrigger
											id="classType"
											className={`${fieldClassName} w-full capitalize [&_svg]:text-secondary`}
										>
											<SelectValue placeholder="e.g. Beginner" />
										</SelectTrigger>
										<SelectContent align="start" alignItemWithTrigger={false}>
											{CLASSES.map((item) => (
												<SelectItem key={item.value} value={item.value}>
													{item.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{error(field)}
								</div>
							)}
						</form.Field>
						<form.Field
							name="appointment"
							validators={{
								onSubmit: ({ value }) => {
									const message = validateBookingAppointment(value, availability);
									return message ?? undefined;
								},
							}}
						>
							{(field) => (
								<div className="flex flex-col gap-2">
									<Label htmlFor="appointment">Preferred Date & Time</Label>
									<DateTimePicker
										id="appointment"
										from={calendarFrom}
										to={calendarTo}
										notBefore={bookingWindow?.earliest}
										notAfter={bookingWindow?.latest}
										placeholder={
											isLoadingAvailability
												? "Loading available times..."
												: "e.g. 09/12/2026 04:00 PM – 06:00 PM"
										}
										minuteStep={
											(availability?.minuteStep ?? 30) as MinuteStep
										}
										fromTime={timeStringToDate(
											availability?.startTime ?? "09:00",
										)}
										toTime={timeStringToDate(
											availability?.endTime ?? "17:00",
										)}
										availableWeekdays={
											availability
												? weekdaysToIndices(availability.availableDays)
												: undefined
										}
										disabled={isLoadingAvailability}
										value={field.state.value}
										onChange={field.handleChange}
									/>
									{error(field)}
								</div>
							)}
						</form.Field>
					</div>
					<Button
						type="submit"
						disabled={bookingMutation.isPending}
						className="h-auto w-fit cursor-pointer gap-2 self-end rounded-full bg-primary p-1.5 pl-4 text-foreground hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
					>
						<p className="text-white">
							{bookingMutation.isPending
								? "Submitting..."
								: "Book Your Session"}
						</p>
						<span className="grid size-11 place-content-center rounded-full bg-white">
							<ArrowRightIcon className="size-4 text-primary" />
						</span>
					</Button>
				</form>
			</div>
		</section>
	);
};
