import { startOfDay } from "date-fns";
import { z } from "zod";

export const WEEKDAYS = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

const weekdaySchema = z.enum(WEEKDAYS);

export function weekdayToIndex(day: Weekday) {
	return WEEKDAYS.indexOf(day);
}

export function dateToWeekday(date: Date): Weekday {
	return WEEKDAYS[date.getDay()];
}

export function weekdaysToIndices(days: Weekday[]) {
	return days.map(weekdayToIndex);
}

export function sortWeekdays(days: Weekday[]) {
	return [...new Set(days)].sort((a, b) => weekdayToIndex(a) - weekdayToIndex(b));
}

export function formatWeekday(day: Weekday, style: "short" | "long" = "long") {
	const label = day.charAt(0).toUpperCase() + day.slice(1);
	return style === "short" ? label.slice(0, 3) : label;
}

export const MINUTE_STEPS = [5, 15, 30, 60] as const;

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const bookingAvailabilitySchema = z
	.object({
		availableDays: z
			.array(weekdaySchema)
			.min(1, "Select at least one available day"),
		startTime: z.string().regex(timePattern, "Use HH:mm format for start time"),
		endTime: z.string().regex(timePattern, "Use HH:mm format for end time"),
		minuteStep: z.union([
			z.literal(5),
			z.literal(15),
			z.literal(30),
			z.literal(60),
		]),
		minNoticeHours: z
			.number()
			.int()
			.min(1, "Minimum notice must be at least 1 hour")
			.max(168, "Minimum notice cannot exceed 168 hours (1 week)"),
		maxAdvanceDays: z
			.number()
			.int()
			.min(1, "Maximum advance must be at least 1 day")
			.max(365, "Maximum advance cannot exceed 365 days"),
	})
	.refine(
		(value) => {
			const [startHour, startMinute] = value.startTime.split(":").map(Number);
			const [endHour, endMinute] = value.endTime.split(":").map(Number);
			const start = (startHour ?? 0) * 60 + (startMinute ?? 0);
			const end = (endHour ?? 0) * 60 + (endMinute ?? 0);
			return end > start;
		},
		{
			message: "End time must be after start time",
			path: ["endTime"],
		},
	);

export type BookingAvailabilityInput = z.infer<typeof bookingAvailabilitySchema>;

export type BookingAvailability = BookingAvailabilityInput;

export const DEFAULT_BOOKING_AVAILABILITY: BookingAvailability = {
	availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
	startTime: "09:00",
	endTime: "17:00",
	minuteStep: 30,
	minNoticeHours: 24,
	maxAdvanceDays: 30,
};

export function parseAvailabilityDays(raw: string): Weekday[] {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return DEFAULT_BOOKING_AVAILABILITY.availableDays;

		const days: Weekday[] = [];
		for (const item of parsed) {
			if (
				typeof item === "string" &&
				WEEKDAYS.includes(item as Weekday)
			) {
				days.push(item as Weekday);
				continue;
			}
			if (
				typeof item === "number" &&
				Number.isInteger(item) &&
				item >= 0 &&
				item <= 6
			) {
				const weekday = WEEKDAYS[item];
				if (weekday) days.push(weekday);
			}
		}

		return days.length > 0
			? sortWeekdays(days)
			: DEFAULT_BOOKING_AVAILABILITY.availableDays;
	} catch {
		return DEFAULT_BOOKING_AVAILABILITY.availableDays;
	}
}

export function timeStringToDate(time: string) {
	const [hours, minutes] = time.split(":").map(Number);
	const date = new Date(0, 0, 0, hours ?? 0, minutes ?? 0, 0, 0);
	return date;
}

export function dateToTimeString(date: Date) {
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	return `${hours}:${minutes}`;
}

export function getBookingWindow(
	availability: BookingAvailability,
	now = new Date(),
) {
	const earliest = new Date(
		now.getTime() + availability.minNoticeHours * 60 * 60 * 1000,
	);
	const latestDay = startOfDay(now);
	latestDay.setDate(latestDay.getDate() + availability.maxAdvanceDays);
	const latest = new Date(latestDay);
	latest.setHours(23, 59, 59, 999);
	return { earliest, latestDay, latest };
}

export function validateBookingAppointment(
	appointment: { from?: Date; to?: Date },
	availability?: BookingAvailability,
) {
	if (!appointment.from) {
		return "Select a preferred start date and time";
	}
	if (!appointment.to) {
		return "Select a preferred end date and time";
	}
	if (appointment.to.getTime() <= appointment.from.getTime()) {
		return "End time must be after start time";
	}
	if (availability) {
		return isAppointmentWithinAvailability(
			appointment.from,
			appointment.to,
			availability,
		);
	}
	return null;
}

export function isAppointmentWithinAvailability(
	start: Date,
	end: Date | undefined,
	availability: BookingAvailability,
	now = new Date(),
) {
	const { earliest, latest } = getBookingWindow(availability, now);

	if (start.getTime() < earliest.getTime()) {
		return `Book at least ${availability.minNoticeHours} hours in advance`;
	}

	if (start.getTime() > latest.getTime()) {
		return `Bookings can only be made up to ${availability.maxAdvanceDays} days ahead`;
	}

	if (end && end.getTime() > latest.getTime()) {
		return `Bookings can only be made up to ${availability.maxAdvanceDays} days ahead`;
	}

	if (!availability.availableDays.includes(dateToWeekday(start))) {
		return "Selected day is not available for booking";
	}

	if (end && !availability.availableDays.includes(dateToWeekday(end))) {
		return "Selected end day is not available for booking";
	}

	const startMinutes = start.getHours() * 60 + start.getMinutes();
	const endMinutes = end
		? end.getHours() * 60 + end.getMinutes()
		: startMinutes;
	const [windowStartHour, windowStartMinute] = availability.startTime
		.split(":")
		.map(Number);
	const [windowEndHour, windowEndMinute] = availability.endTime
		.split(":")
		.map(Number);
	const windowStart = (windowStartHour ?? 0) * 60 + (windowStartMinute ?? 0);
	const windowEnd = (windowEndHour ?? 0) * 60 + (windowEndMinute ?? 0);

	if (startMinutes < windowStart || startMinutes > windowEnd) {
		return "Selected start time is outside available hours";
	}

	if (endMinutes < windowStart || endMinutes > windowEnd) {
		return "Selected end time is outside available hours";
	}

	if (end && end.getTime() <= start.getTime()) {
		return "End time must be after start time";
	}

	const step = availability.minuteStep;
	if (startMinutes % step !== 0 || endMinutes % step !== 0) {
		return `Times must align to ${step}-minute intervals`;
	}

	return null;
}
