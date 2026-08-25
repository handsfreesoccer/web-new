import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "#/components/ui/tabs";
import { AttendanceByDayTab } from "#/routes/admin/-components/attendance-by-day-tab";
import { StudentsTab } from "#/routes/admin/-components/students-tab";

export function AttendanceDashboard() {
	return (
		<div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
			<div className="flex flex-col gap-2">
				<h2 className="font-bold text-secondary text-xl">Attendance</h2>
				<p className="text-muted-foreground text-sm">
					Track student visits and review who attended on a given day.
				</p>
			</div>

			<Tabs defaultValue="students">
				<TabsList>
					<TabsTrigger value="students">Students</TabsTrigger>
					<TabsTrigger value="by-day">By day</TabsTrigger>
				</TabsList>
				<TabsContent value="students" className="pt-4">
					<StudentsTab />
				</TabsContent>
				<TabsContent value="by-day" className="pt-4">
					<AttendanceByDayTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
