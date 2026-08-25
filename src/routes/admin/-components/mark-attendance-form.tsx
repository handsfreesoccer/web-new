import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import api from "#/api/http/xhr";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import { Input } from "#/components/ui/input";
import {
	attendanceByDateQueryKey,
	attendanceMonthQueryKey,
	studentAttendanceQueryKey,
	toDateKey,
	toMonthKey,
} from "#/lib/admin-attendance";

type MarkAttendanceFormProps = {
	bookingId: number;
	onSuccess?: () => void;
};

export function MarkAttendanceForm({
	bookingId,
	onSuccess,
}: MarkAttendanceFormProps) {
	const queryClient = useQueryClient();
	const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());

	const attendanceMutation = useMutation({
		mutationFn: (date: Date) =>
			api.post(`/admin/students/${bookingId}/attendance`, {
				attendedAt: date.toISOString(),
			}),
		onSuccess: async (_data, date) => {
			toast.success("Attendance marked.");
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["admin-students"] }),
				queryClient.invalidateQueries({
					queryKey: studentAttendanceQueryKey(bookingId),
				}),
				queryClient.invalidateQueries({
					queryKey: attendanceByDateQueryKey(toDateKey(date)),
				}),
				queryClient.invalidateQueries({
					queryKey: attendanceMonthQueryKey(toMonthKey(date)),
				}),
			]);
			onSuccess?.();
		},
		onError: () => toast.error("Could not mark attendance."),
	});

	return (
		<div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
			<p className="font-medium text-secondary text-sm">Mark a new visit</p>
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start">
				<Calendar
					mode="single"
					selected={attendanceDate}
					onSelect={(date) => date && setAttendanceDate(date)}
				/>
				<div className="flex min-w-56 flex-col gap-3">
					<Input
						type="datetime-local"
						value={
							attendanceDate
								? new Date(
										attendanceDate.getTime() -
											attendanceDate.getTimezoneOffset() * 60000,
									)
										.toISOString()
										.slice(0, 16)
								: ""
						}
						onChange={(event) =>
							setAttendanceDate(new Date(event.target.value))
						}
					/>
					<Button
						className="w-fit"
						disabled={attendanceMutation.isPending}
						onClick={() => void attendanceMutation.mutateAsync(attendanceDate)}
					>
						{attendanceMutation.isPending ? "Saving..." : "Save attendance"}
					</Button>
				</div>
			</div>
		</div>
	);
}
