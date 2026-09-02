import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "#/components/ui/tabs";
import { AttendanceByDayTab } from "#/routes/admin/-components/attendance-by-day-tab";
import { ContactsTab } from "#/routes/admin/-components/contacts-tab";
import { StudentsTab } from "#/routes/admin/-components/students-tab";

export function AttendanceDashboard() {
	return (
		<div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
			<div className="flex flex-col gap-2">
				<h2 className="font-bold text-secondary text-xl">Attendance</h2>
				<p className="text-muted-foreground text-sm">
					Track student visits, review who attended on a given day, and read
					contact inquiries.
				</p>
			</div>

			<Tabs defaultValue="students">
				<TabsList>
					<TabsTrigger value="students">Students</TabsTrigger>
					<TabsTrigger value="by-day">By day</TabsTrigger>
					<TabsTrigger value="contacts">Contacts</TabsTrigger>
				</TabsList>
				<TabsContent value="students" className="pt-4">
					<StudentsTab />
				</TabsContent>
				<TabsContent value="by-day" className="pt-4">
					<AttendanceByDayTab />
				</TabsContent>
				<TabsContent value="contacts" className="pt-4">
					<ContactsTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
