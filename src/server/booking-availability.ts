import { prisma } from "#/db";
import {
	DEFAULT_BOOKING_AVAILABILITY,
	type BookingAvailability,
	type BookingAvailabilityInput,
	parseAvailabilityDays,
	sortWeekdays,
} from "#/lib/booking-availability-schema";

const toAvailability = (record: {
	availableDays: string;
	startTime: string;
	endTime: string;
	minuteStep: number;
	minNoticeHours: number;
	maxAdvanceDays: number;
}): BookingAvailability => ({
	availableDays: parseAvailabilityDays(record.availableDays),
	startTime: record.startTime,
	endTime: record.endTime,
	minuteStep: (record.minuteStep ||
		DEFAULT_BOOKING_AVAILABILITY.minuteStep) as BookingAvailability["minuteStep"],
	minNoticeHours:
		record.minNoticeHours ?? DEFAULT_BOOKING_AVAILABILITY.minNoticeHours,
	maxAdvanceDays:
		record.maxAdvanceDays ?? DEFAULT_BOOKING_AVAILABILITY.maxAdvanceDays,
});

export async function getBookingAvailability(): Promise<BookingAvailability> {
	const record = await prisma.bookingAvailability.findUnique({ where: { id: 1 } });
	if (!record) {
		const created = await prisma.bookingAvailability.create({
			data: {
				id: 1,
				availableDays: JSON.stringify(
					DEFAULT_BOOKING_AVAILABILITY.availableDays,
				),
				startTime: DEFAULT_BOOKING_AVAILABILITY.startTime,
				endTime: DEFAULT_BOOKING_AVAILABILITY.endTime,
				minuteStep: DEFAULT_BOOKING_AVAILABILITY.minuteStep,
				minNoticeHours: DEFAULT_BOOKING_AVAILABILITY.minNoticeHours,
				maxAdvanceDays: DEFAULT_BOOKING_AVAILABILITY.maxAdvanceDays,
			},
		});
		return toAvailability(created);
	}
	return toAvailability(record);
}

export async function updateBookingAvailability(input: BookingAvailabilityInput) {
	const uniqueDays = sortWeekdays(input.availableDays);
	const record = await prisma.bookingAvailability.upsert({
		where: { id: 1 },
		create: {
			id: 1,
			availableDays: JSON.stringify(uniqueDays),
			startTime: input.startTime,
			endTime: input.endTime,
			minuteStep: input.minuteStep,
			minNoticeHours: input.minNoticeHours,
			maxAdvanceDays: input.maxAdvanceDays,
		},
		update: {
			availableDays: JSON.stringify(uniqueDays),
			startTime: input.startTime,
			endTime: input.endTime,
			minuteStep: input.minuteStep,
			minNoticeHours: input.minNoticeHours,
			maxAdvanceDays: input.maxAdvanceDays,
		},
	});
	return toAvailability(record);
}
