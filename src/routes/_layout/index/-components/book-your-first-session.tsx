import { useForm } from "@tanstack/react-form";
import { ArrowRightIcon } from "lucide-react";
import type React from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { BOOKING_SECTION_ID } from "#/lib/constants";
import { useHashScroll } from "#/lib/use-hash-scroll";
import { bookingSchema } from "#/lib/booking-schema";
import { DateTimePicker, type DateTimeRange } from "#/components/ui-extended/date-time-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";

const CLASSES = [
	{ value: "beginner", label: "Beginner" }, { value: "intermediate", label: "Intermediate" },
	{ value: "one-on-one", label: "1:1 Coaching" }, { value: "biweekly-saturday", label: "Biweekly Saturday Intensive" },
] as const;
type FormValues = { firstName: string; lastName: string; email: string; phone: string; classType: typeof CLASSES[number]["value"]; appointment: DateTimeRange };
const fieldClassName = "h-10";

export const BookYourFirstSession: React.FC = () => {
	useHashScroll(BOOKING_SECTION_ID);
	const form = useForm({
		defaultValues: { firstName: "", lastName: "", email: "", phone: "", classType: "beginner", appointment: {} },
		onSubmit: async ({ value }) => {
			const typedValue = value as FormValues;
			const parsed = bookingSchema.safeParse({ ...typedValue, appointmentStart: typedValue.appointment.from, appointmentEnd: typedValue.appointment.to });
			if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Please complete the form."); return; }
			const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...parsed.data, appointmentStart: parsed.data.appointmentStart.toISOString(), appointmentEnd: parsed.data.appointmentEnd?.toISOString() }) });
			const result = await response.json() as { success: boolean; message?: string; errors?: string[] };
			if (!response.ok || !result.success) { toast.error(result.errors?.[0] ?? result.message ?? "Booking could not be submitted."); return; }
			toast.success("Your booking information has been submitted.");
			form.reset();
		},
	});
	const error = (field: { state: { meta: { errors: unknown[] } } }) => field.state.meta.errors[0] ? <p className="text-destructive text-xs">{String(field.state.meta.errors[0])}</p> : null;
	return <section id={BOOKING_SECTION_ID} className="relative mx-auto flex max-w-360 scroll-mt-28 flex-col gap-12 px-4 py-8 sm:gap-16 sm:px-8 sm:py-16 md:px-16"><div className="relative grid w-full place-content-center overflow-hidden rounded-3xl p-4 sm:p-16"><img src="https://placehold.co/600x480/black/black" alt="Book Your First Session" className="absolute inset-0 size-full object-cover" /><form onSubmit={(event) => { event.preventDefault(); void form.handleSubmit(); }} className="relative flex w-full flex-col gap-8 rounded-2xl bg-white px-4 py-8 sm:max-w-fit sm:gap-12 sm:px-12 sm:py-12">
		<div className="flex flex-col gap-4 sm:gap-6"><h1 className="text-center font-bold text-3xl text-secondary sm:text-5xl">BOOK YOUR FIRST SESSION</h1><p className="text-center text-muted-foreground text-sm sm:text-base">Reserve your spot today and start playing with confidence.</p></div>
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{(["firstName", "lastName", "email", "phone"] as const).map((name) => <form.Field key={name} name={name}>{(field) => <div className="flex flex-col gap-2"><Label htmlFor={name}>{name === "firstName" ? "First Name" : name === "lastName" ? "Last Name" : name[0]?.toUpperCase() + name.slice(1)}</Label><Input id={name} type={name === "email" ? "email" : name === "phone" ? "tel" : "text"} autoComplete={name === "firstName" ? "given-name" : name === "lastName" ? "family-name" : name} placeholder={name === "firstName" ? "e.g. Jordan" : name === "lastName" ? "e.g. Mensah" : name === "email" ? "e.g. jordan@email.com" : "e.g. (555) 123-4567"} className={fieldClassName} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />{error(field)}</div>}</form.Field>)}
			<form.Field name="classType">{(field) => <div className="flex flex-col gap-2"><Label htmlFor="classType">Select Class</Label><Select value={field.state.value} onValueChange={(value) => field.handleChange(value as FormValues["classType"])}><SelectTrigger id="classType" className={`${fieldClassName} w-full capitalize [&_svg]:text-secondary`}><SelectValue placeholder="e.g. Beginner" /></SelectTrigger><SelectContent align="start" alignItemWithTrigger={false}>{CLASSES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select>{error(field)}</div>}</form.Field>
			<form.Field name="appointment">{(field) => <div className="flex flex-col gap-2"><Label htmlFor="appointment">Preferred Date & Time</Label><DateTimePicker id="appointment" from={new Date()} placeholder="e.g. 09/12/2026 04:00 PM – 06:00 PM" minuteStep={30} value={field.state.value} onChange={field.handleChange} />{error(field)}</div>}</form.Field>
		</div><Button type="submit" className="h-auto w-fit cursor-pointer gap-2 self-end rounded-full bg-primary p-1.5 pl-4 text-foreground hover:bg-primary"><p className="text-white">Book Your Session</p><span className="grid size-11 place-content-center rounded-full bg-white"><ArrowRightIcon className="size-4 text-primary" /></span></Button>
	</form></div></section>;
};
