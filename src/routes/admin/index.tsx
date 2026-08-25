import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Calendar } from "#/components/ui/calendar";
import { Pagination } from "#/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { toast } from "sonner";

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

function AdminPage() {
	const navigate = useNavigate();
	const [items, setItems] = useState<Booking[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [attendanceDate, setAttendanceDate] = useState<Date>();
	const [selected, setSelected] = useState<number>();
	async function load(nextPage = page) {
		let token = localStorage.getItem("hfs_access_token");
		let response = await fetch(`/api/admin/students?page=${nextPage}`, {
			headers: { authorization: `Bearer ${token ?? ""}` },
		});
		if (response.status === 401) {
			const refreshed = await fetch("/api/admin/auth/refresh", {
				method: "POST",
				credentials: "include",
			});
			if (refreshed.ok) {
				const refreshResult = (await refreshed.json()) as {
					data: { accessToken: string };
				};
				token = refreshResult.data.accessToken;
				localStorage.setItem("hfs_access_token", refreshResult.data.accessToken);
				response = await fetch(`/api/admin/students?page=${nextPage}`, {
					headers: { authorization: `Bearer ${token}` },
				});
			}
		}
		if (response.status === 401) {
			await navigate({ to: "/admin/login" });
			return;
		}
		const result = await response.json();
		setItems(result.data);
		setTotalPages(result.meta.pagination.total_pages);
	}
	useEffect(() => {
		void load();
	}, [page]);
	async function markPresent(id: number, date = new Date()) {
		const response = await fetch(`/api/admin/students/${id}/attendance`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${localStorage.getItem("hfs_access_token") ?? ""}`,
			},
			body: JSON.stringify({ attendedAt: date.toISOString() }),
		});
		if (response.ok) {
			toast.success("Attendance marked.");
			void load();
		} else toast.error("Could not mark attendance.");
	}
	async function sendEmail(bookingId: number, type: "reminder" | "payment") {
		const response = await fetch("/api/admin/emails", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${localStorage.getItem("hfs_access_token") ?? ""}`,
			},
			body: JSON.stringify({ bookingId, type }),
		});
		const result = await response.json();
		if (response.ok) toast.success("Email sent.");
		else toast.error(result.message ?? "Email could not be sent.");
	}
	return (
		<main className="min-h-screen bg-[var(--bg-base)] px-4 py-8 sm:px-10">
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="font-bold text-primary text-sm tracking-[.16em]">
							HANDS FREE SOCCER
						</p>
						<h1 className="mt-2 font-bold text-4xl text-secondary">
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
				<div className="mt-8 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
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
										<div>{student.email}</div>
										<div className="text-muted-foreground">{student.phone}</div>
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
					<div className="mt-4">
						<Pagination
							page={page}
							totalPages={totalPages}
							onChange={setPage}
						/>
					</div>
				</div>
				{selected ? (
					<div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<h2 className="font-bold text-xl text-secondary">
								Choose attendance date and time
							</h2>
							<Button variant="ghost" onClick={() => setSelected(undefined)}>
								Close
							</Button>
						</div>
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
							className="mt-4"
							onClick={() => {
								if (attendanceDate) void markPresent(selected, attendanceDate);
							}}
						>
							Save attendance
						</Button>
					</div>
				) : null}
			</div>
		</main>
	);
}
