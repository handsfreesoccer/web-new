import { useQuery } from "@tanstack/react-query";
import api from "#/api/http/xhr";
import type { V2SuccessResponse } from "#/api/http/shared";
import { unwrapV2Data } from "#/api/http/shared";
import { Button } from "#/components/ui/button";
import {
	type AttendanceRecord,
	formatAttendanceDateTime,
	studentAttendanceQueryKey,
} from "#/lib/admin-attendance";
import { MarkAttendanceForm } from "#/routes/admin/-components/mark-attendance-form";

type StudentVisitsPanelProps = {
	bookingId: number;
	studentName: string;
	onClose: () => void;
};

export function StudentVisitsPanel({
	bookingId,
	studentName,
	onClose,
}: StudentVisitsPanelProps) {
	const visitsQuery = useQuery({
		queryKey: studentAttendanceQueryKey(bookingId),
		queryFn: async () => {
			const response = await api.get<V2SuccessResponse<AttendanceRecord[]>>(
				`/admin/students/${bookingId}/attendance`,
			);
			return unwrapV2Data(response);
		},
	});

	const visits = visitsQuery.data ?? [];

	return (
		<div className="flex flex-col gap-4 border-border/60 border-t bg-muted/10 px-4 py-5 sm:px-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-col gap-1">
					<h3 className="font-semibold text-secondary text-lg">
						Recent visits — {studentName}
					</h3>
					<p className="text-muted-foreground text-sm">
						{visits.length === 0
							? "No visits recorded yet."
							: `${visits.length} visit${visits.length === 1 ? "" : "s"} on record`}
					</p>
				</div>
				<Button variant="ghost" size="sm" onClick={onClose}>
					Close
				</Button>
			</div>

			{visitsQuery.isLoading ? (
				<p className="text-muted-foreground text-sm">Loading visits...</p>
			) : visits.length > 0 ? (
				<ul className="flex flex-col gap-2">
					{visits.map((visit) => (
						<li
							key={visit.id}
							className="rounded-xl border border-border/60 bg-white px-4 py-3 text-sm"
						>
							{formatAttendanceDateTime(visit.attendedAt)}
						</li>
					))}
				</ul>
			) : null}

			<MarkAttendanceForm bookingId={bookingId} />
		</div>
	);
}
