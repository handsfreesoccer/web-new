type CalendarDetails = {
	uid: string;
	firstName: string;
	start: Date;
	end: Date;
};

const calendarDate = (date: Date) =>
	date
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\.\d{3}Z$/, "Z");

export const createCalendarInvite = ({
	uid,
	firstName,
	start,
	end,
}: CalendarDetails) =>
	[
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Hands Free Soccer//Booking//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:REQUEST",
		"BEGIN:VEVENT",
		`UID:${uid}@handsfreesoccer.com`,
		`DTSTAMP:${calendarDate(new Date())}`,
		`DTSTART:${calendarDate(start)}`,
		`DTEND:${calendarDate(end)}`,
		"SUMMARY:Hands Free Soccer training session",
		"LOCATION:Hands Free Soccer courts, Allen TX",
		`DESCRIPTION:Hi ${firstName}, we look forward to seeing you at Hands Free Soccer.`,
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");
