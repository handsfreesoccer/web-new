import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import api from "#/api/http/xhr";
import type { V2PaginatedSuccessResponse } from "#/api/http/shared";
import { Button } from "#/components/ui/button";
import { Pagination } from "#/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import {
	type AdminStudent,
	adminStudentsQueryKey,
	formatAttendanceDateTime,
} from "#/lib/admin-attendance";
import { cn } from "#/lib/utils";
import { StudentVisitsPanel } from "#/routes/admin/-components/student-visits-panel";

export function StudentsTab() {
	const [page, setPage] = useState(1);
	const [expandedId, setExpandedId] = useState<number>();

	const studentsQuery = useQuery({
		queryKey: adminStudentsQueryKey(page),
		queryFn: async () =>
			(await api.get<V2PaginatedSuccessResponse<AdminStudent>>(
				`/admin/students?page=${page}`,
			)).data,
	});

	const emailMutation = useMutation({
		mutationFn: ({
			bookingId,
			type,
		}: {
			bookingId: number;
			type: "reminder" | "payment";
		}) => api.post("/admin/emails", { bookingId, type }),
		onSuccess: () => toast.success("Email sent."),
		onError: (error) => {
			const result = (error as { response?: { data?: { message?: string } } })
				.response?.data;
			toast.error(result?.message ?? "Email could not be sent.");
		},
	});

	const items = studentsQuery.data?.data ?? [];
	const totalPages = studentsQuery.data?.meta?.pagination.total_pages ?? 1;

	const toggleExpanded = (id: number) => {
		setExpandedId((current) => (current === id ? undefined : id));
	};

	return (
		<div className="flex flex-col gap-4">
			<p className="text-muted-foreground text-sm">
				Click a student to view their recent visits and mark attendance.
			</p>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-8" />
						<TableHead>Name</TableHead>
						<TableHead>Contact</TableHead>
						<TableHead>Class</TableHead>
						<TableHead>Appointment (UTC)</TableHead>
						<TableHead>Last visit</TableHead>
						<TableHead>Visits</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((student) => {
						const isExpanded = expandedId === student.id;
						const lastVisit = student.attendances[0];

						return (
							<Fragment key={student.id}>
								<TableRow
									key={student.id}
									className={cn(
										"cursor-pointer",
										isExpanded && "bg-muted/20",
									)}
									onClick={() => toggleExpanded(student.id)}
								>
									<TableCell>
										<ChevronDownIcon
											className={cn(
												"size-4 text-muted-foreground transition-transform",
												isExpanded && "rotate-180",
											)}
										/>
									</TableCell>
									<TableCell className="font-medium">
										{student.firstName} {student.lastName}
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-1">
											<span>{student.email}</span>
											<span className="text-muted-foreground">
												{student.phone}
											</span>
										</div>
									</TableCell>
									<TableCell className="capitalize">
										{student.classType.replaceAll("-", " ")}
									</TableCell>
									<TableCell>
										{formatAttendanceDateTime(student.appointmentStartUtc)}
									</TableCell>
									<TableCell>
										{lastVisit
											? formatAttendanceDateTime(lastVisit.attendedAt)
											: "Not yet"}
									</TableCell>
									<TableCell>{student._count.attendances}</TableCell>
									<TableCell onClick={(event) => event.stopPropagation()}>
										<div className="flex flex-wrap gap-1">
											<Button
												size="sm"
												onClick={() => toggleExpanded(student.id)}
											>
												{isExpanded ? "Hide" : "Visits"}
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													void emailMutation.mutateAsync({
														bookingId: student.id,
														type: "reminder",
													})
												}
											>
												Reminder
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													void emailMutation.mutateAsync({
														bookingId: student.id,
														type: "payment",
													})
												}
											>
												Payment
											</Button>
										</div>
									</TableCell>
								</TableRow>
								{isExpanded ? (
									<TableRow key={`${student.id}-visits`} className="hover:bg-transparent">
										<TableCell colSpan={8} className="p-0">
											<StudentVisitsPanel
												bookingId={student.id}
												studentName={`${student.firstName} ${student.lastName}`}
												onClose={() => setExpandedId(undefined)}
											/>
										</TableCell>
									</TableRow>
								) : null}
							</Fragment>
						);
					})}
				</TableBody>
			</Table>

			{studentsQuery.isLoading ? (
				<p className="py-10 text-center text-muted-foreground">
					Loading students...
				</p>
			) : null}

			{!studentsQuery.isLoading && items.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground">
					No students have booked yet.
				</p>
			) : null}

			<Pagination page={page} totalPages={totalPages} onChange={setPage} />
		</div>
	);
}
