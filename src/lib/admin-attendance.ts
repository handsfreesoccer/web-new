import { startOfDay } from "date-fns";

export type AdminStudent = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	classType: string;
	appointmentStartUtc: string;
	attendances: Array<{ attendedAt: string }>;
	_count: { attendances: number };
};

export type AttendanceRecord = {
	id: number;
	attendedAt: string;
};

export type AttendanceWithBooking = AttendanceRecord & {
	booking: {
		id: number;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		classType: string;
	};
};

export const adminStudentsQueryKey = (page: number) =>
	["admin-students", page] as const;

export const studentAttendanceQueryKey = (bookingId: number) =>
	["student-attendance", bookingId] as const;

export const attendanceByDateQueryKey = (dateKey: string) =>
	["attendance-by-date", dateKey] as const;

export const attendanceMonthQueryKey = (monthKey: string) =>
	["attendance-month", monthKey] as const;

export function formatAttendanceDateTime(value: string | Date) {
	return new Date(value).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

export function toDateKey(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function toMonthKey(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

export function fromDateKey(dateKey: string) {
	const [year, month, day] = dateKey.split("-").map(Number);
	return startOfDay(new Date(year ?? 0, (month ?? 1) - 1, day ?? 1));
}
