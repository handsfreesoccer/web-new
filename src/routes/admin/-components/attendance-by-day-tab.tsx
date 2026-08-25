import { useQuery } from "@tanstack/react-query";
import { startOfDay, startOfMonth } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { V2SuccessResponse } from "#/api/http/shared";
import { unwrapV2Data } from "#/api/http/shared";
import api from "#/api/http/xhr";
import { Calendar } from "#/components/ui/calendar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import {
	type AttendanceWithBooking,
	attendanceByDateQueryKey,
	attendanceMonthQueryKey,
	formatAttendanceDateTime,
	fromDateKey,
	toDateKey,
	toMonthKey,
} from "#/lib/admin-attendance";

type AttendanceMonthResponse = {
	dates: string[];
};

export function AttendanceByDayTab() {
	const [visibleMonth, setVisibleMonth] = useState(() =>
		startOfMonth(new Date()),
	);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(() =>
		startOfDay(new Date()),
	);

	const monthKey = toMonthKey(visibleMonth);

	const monthQuery = useQuery({
		queryKey: attendanceMonthQueryKey(monthKey),
		queryFn: async () => {
			const response = await api.get<
				V2SuccessResponse<AttendanceMonthResponse>
			>(`/admin/attendance?month=${monthKey}`);
			return unwrapV2Data(response);
		},
	});

	const attendanceDates = useMemo(
		() => new Set(monthQuery.data?.dates ?? []),
		[monthQuery.data?.dates],
	);

	useEffect(() => {
		if (!monthQuery.data) return;

		const { dates } = monthQuery.data;
		if (dates.length === 0) {
			setSelectedDate(undefined);
			return;
		}

		setSelectedDate((current) => {
			const currentKey = current ? toDateKey(current) : "";
			const currentInMonth = current && toMonthKey(current) === monthKey;
			if (currentInMonth && dates.includes(currentKey)) return current;
			const latest = dates.at(-1);
			return latest ? fromDateKey(latest) : current;
		});
	}, [monthQuery.data, monthKey]);

	const dateKey = selectedDate ? toDateKey(selectedDate) : "";

	const attendanceQuery = useQuery({
		queryKey: attendanceByDateQueryKey(dateKey),
		enabled: Boolean(selectedDate),
		queryFn: async () => {
			const response = await api.get<
				V2SuccessResponse<AttendanceWithBooking[]>
			>(`/admin/attendance?date=${dateKey}`);
			return unwrapV2Data(response);
		},
	});

	const attendances = attendanceQuery.data ?? [];
	const hasAttendanceDays = attendanceDates.size > 0;

	return (
		<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
			<div className="flex flex-col gap-3">
				<p className="max-w-sm text-muted-foreground text-sm">
					Only days with recorded attendance can be selected. Change month to
					load more dates.
				</p>
				<div className="w-fit rounded-2xl border border-border/60 bg-muted/10 p-3">
					<Calendar
						mode="single"
						month={visibleMonth}
						onMonthChange={setVisibleMonth}
						selected={selectedDate}
						onSelect={(date) => date && setSelectedDate(startOfDay(date))}
						disabled={(date) => {
							if (monthQuery.isLoading || monthQuery.isFetching) return true;
							return !attendanceDates.has(toDateKey(date));
						}}
					/>
				</div>
				{monthQuery.isLoading ? (
					<p className="text-muted-foreground text-xs">Loading month...</p>
				) : null}
				{!monthQuery.isLoading && !hasAttendanceDays ? (
					<p className="text-muted-foreground text-xs">
						No attendance recorded this month.
					</p>
				) : null}
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-4">
				{selectedDate ? (
					<>
						<div className="flex flex-col gap-1">
							<h3 className="font-semibold text-lg text-secondary">
								{selectedDate.toLocaleDateString(undefined, {
									weekday: "long",
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</h3>
							<p className="text-muted-foreground text-sm">
								{attendanceQuery.isLoading
									? "Loading attendance..."
									: `${attendances.length} visit${attendances.length === 1 ? "" : "s"}`}
							</p>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Time</TableHead>
									<TableHead>Student</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Class</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{attendances.map((record) => (
									<TableRow key={record.id}>
										<TableCell>
											{formatAttendanceDateTime(record.attendedAt)}
										</TableCell>
										<TableCell className="font-medium">
											{record.booking.firstName} {record.booking.lastName}
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												<span>{record.booking.email}</span>
												<span className="text-muted-foreground">
													{record.booking.phone}
												</span>
											</div>
										</TableCell>
										<TableCell className="capitalize">
											{record.booking.classType.replaceAll("-", " ")}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{!attendanceQuery.isLoading && attendances.length === 0 ? (
							<p className="py-10 text-center text-muted-foreground">
								No attendance recorded for this day.
							</p>
						) : null}
					</>
				) : (
					<p className="py-10 text-center text-muted-foreground">
						Select a highlighted day to view attendance.
					</p>
				)}
			</div>
		</div>
	);
}
