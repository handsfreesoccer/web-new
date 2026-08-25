import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import api from "#/api/http/xhr";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import { Input } from "#/components/ui/input";
import { Pagination } from "#/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { AdminAuthGuard } from "#/routes/admin/-components/admin-auth-guard";

export const Route = createFileRoute("/admin/")({ component: AdminPage });

type Booking = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	classType: string;
	appointmentStartUtc: string;
	attendances: Array<{ attendedAt: string }>;
};

type StudentsResponse = {
	data: Booking[];
	meta: { pagination: { total_pages: number } };
};

function AdminPage() {
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [attendanceDate, setAttendanceDate] = useState<Date>();
	const [selected, setSelected] = useState<number>();
	const queryClient = useQueryClient();
	const studentsQuery = useQuery({
		queryKey: ["admin-students", page],
		queryFn: async () =>
			(await api.get<StudentsResponse>(`/admin/students?page=${page}`)).data,
	});
	const items = studentsQuery.data?.data ?? [];
	const totalPages = studentsQuery.data?.meta.pagination.total_pages ?? 1;
	const attendanceMutation = useMutation({
		mutationFn: ({ id, date }: { id: number; date: Date }) =>
			api.post(`/admin/students/${id}/attendance`, {
				attendedAt: date.toISOString(),
			}),
		onSuccess: () => {
			toast.success("Attendance marked.");
			void queryClient.invalidateQueries({ queryKey: ["admin-students"] });
		},
		onError: () => toast.error("Could not mark attendance."),
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

	async function markPresent(id: number, date = new Date()) {
		await attendanceMutation.mutateAsync({ id, date });
	}

	async function sendEmail(bookingId: number, type: "reminder" | "payment") {
		await emailMutation.mutateAsync({ bookingId, type });
	}

	return (
		<AdminAuthGuard>
			<main className="flex min-h-screen flex-col bg-(--bg-base) px-4 py-8 sm:px-10">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div className="flex flex-col gap-2">
							<p className="font-bold text-primary text-sm tracking-[.16em]">
								HANDS FREE SOCCER
							</p>
							<h1 className="font-bold text-4xl text-secondary">
								Students dashboard
							</h1>
						</div>
						<Button
							variant="outline"
							onClick={() => {
								localStorage.removeItem("hfs_access_token");
								void navigate({ to: "/admin/login" });
							}}
						>
							Sign out
						</Button>
					</div>

					<div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Class</TableHead>
									<TableHead>Appointment (UTC)</TableHead>
									<TableHead>Last visit</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{items.map((student) => (
									<TableRow key={student.id}>
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
											{new Date(student.appointmentStartUtc).toLocaleString()}
										</TableCell>
										<TableCell>
											{student.attendances[0]
												? new Date(
														student.attendances[0].attendedAt,
													).toLocaleDateString()
												: "Not yet"}
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1">
												<Button
													size="sm"
													onClick={() => {
														setSelected(student.id);
														setAttendanceDate(new Date());
													}}
												>
													Present
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => void sendEmail(student.id, "reminder")}
												>
													Reminder
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => void sendEmail(student.id, "payment")}
												>
													Payment
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{items.length === 0 ? (
							<p className="py-10 text-center text-muted-foreground">
								No students have booked yet.
							</p>
						) : null}
						<Pagination
							page={page}
							totalPages={totalPages}
							onChange={setPage}
						/>
					</div>

					{selected ? (
						<div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
							<div className="flex items-center justify-between gap-4">
								<h2 className="font-bold text-xl text-secondary">
									Choose attendance date and time
								</h2>
								<Button variant="ghost" onClick={() => setSelected(undefined)}>
									Close
								</Button>
							</div>
							<div className="flex flex-col gap-4">
								<Calendar
									mode="single"
									selected={attendanceDate}
									onSelect={setAttendanceDate}
								/>
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
									onClick={() => {
										if (attendanceDate) {
											void markPresent(selected, attendanceDate);
										}
									}}
								>
									Save attendance
								</Button>
							</div>
						</div>
					) : null}
				</div>
			</main>
		</AdminAuthGuard>
	);
}
