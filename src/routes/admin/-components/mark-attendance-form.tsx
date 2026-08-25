import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import api from "#/api/http/xhr";
import { Button } from "#/components/ui/button";
import { DateTimeSinglePicker } from "#/components/ui-extended/date-time-picker";
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
	const [attendanceDate, setAttendanceDate] = useState<Date>(() => new Date());

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
			<DateTimeSinglePicker
				value={attendanceDate}
				onChange={(date) => date && setAttendanceDate(date)}
				minuteStep={15}
				notAfter={new Date()}
			/>
			<div className="flex flex-wrap items-center gap-3">
				<p className="text-muted-foreground text-sm tabular-nums">
					{format(attendanceDate, "EEEE, MMM d, yyyy · h:mm aa")}
				</p>
				<Button
					className="w-fit"
					disabled={attendanceMutation.isPending}
					onClick={() => void attendanceMutation.mutateAsync(attendanceDate)}
				>
					{attendanceMutation.isPending ? "Saving..." : "Save attendance"}
				</Button>
			</div>
		</div>
	);
}
