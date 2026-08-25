// #Ref: https://time.rdsx.dev/

import { format, isSameDay, startOfDay } from "date-fns";
import { CalendarClockIcon } from "lucide-react";
import * as React from "react";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { ScrollArea } from "#/components/ui/scroll-area";
import { cn } from "#/lib/utils";

const HOURS_24 = Array.from({ length: 24 }, (_, index) => index);
const HOURS_12 = Array.from({ length: 12 }, (_, index) => index + 1);
const MERIDIEMS = [0, 1] as const;

/** Allowed minute increments. `60` hides the minutes column. */
export type MinuteStep = 5 | 15 | 30 | 60;

const padTime = (value: number) => value.toString().padStart(2, "0");

const EMPTY_RANGE: DateTimeRange = {};

/**
 * A start (`from`) and end (`to`) instant.
 * Hours and minutes live on each `Date` in the local timezone.
 */
export type DateTimeRange = {
	from?: Date;
	to?: Date;
};

type TimePart = "hour" | "minute" | "ampm";
type RangeBound = "from" | "to";

/**
 * Copies hours and minutes from `current` onto `date`, or midnight if none.
 */
function mergeDateWithTime(date: Date, current: Date | undefined) {
	const nextDate = new Date(date);
	if (current) {
		nextDate.setHours(current.getHours(), current.getMinutes(), 0, 0);
	} else {
		nextDate.setHours(0, 0, 0, 0);
	}
	return nextDate;
}

/**
 * Sets the hour, minute, or meridiem on `date` without changing the calendar day.
 *
 * @param is24hours - When `false`, `hour` is 1–12 and `ampm` is `0` (AM) or `1` (PM).
 */
function applyTime(
	date: Date,
	type: TimePart,
	value: number,
	is24hours: boolean,
	minuteStep: MinuteStep,
) {
	const nextDate = new Date(date);

	if (type === "hour") {
		if (is24hours) {
			nextDate.setHours(value);
		} else {
			const hour = value % 12;
			nextDate.setHours(nextDate.getHours() >= 12 ? hour + 12 : hour);
		}
		if (minuteStep === 60) {
			nextDate.setMinutes(0);
		}
	} else if (type === "minute") {
		nextDate.setMinutes(value);
	} else if (value === 0 && nextDate.getHours() >= 12) {
		nextDate.setHours(nextDate.getHours() - 12);
	} else if (value === 1 && nextDate.getHours() < 12) {
		nextDate.setHours(nextDate.getHours() + 12);
	}

	if (minuteStep === 60) {
		nextDate.setMinutes(0);
	}

	nextDate.setSeconds(0, 0);
	return nextDate;
}

/**
 * Swaps bounds when `to` is earlier than `from` so the range stays ordered.
 */
function orderRange(range: DateTimeRange): DateTimeRange {
	const { from, to } = range;
	if (from && to && to.getTime() < from.getTime()) {
		return { from: to, to: from };
	}
	return range;
}

/**
 * Formats a range for the trigger. Same-day ranges hide the repeated date.
 *
 * @param is24hours - Uses `HH:mm` when `true`, `hh:mm aa` when `false`.
 */
function formatRange(range: DateTimeRange, is24hours: boolean) {
	const dateTimePattern = is24hours ? "MM/dd/yyyy HH:mm" : "MM/dd/yyyy hh:mm aa";
	const timePattern = is24hours ? "HH:mm" : "hh:mm aa";

	if (!range.from) {
		return undefined;
	}

	if (!range.to) {
		return format(range.from, dateTimePattern);
	}

	if (isSameDay(range.from, range.to)) {
		return `${format(range.from, dateTimePattern)} – ${format(range.to, timePattern)}`;
	}

	return `${format(range.from, dateTimePattern)} – ${format(range.to, dateTimePattern)}`;
}

function toHiddenValue(date: Date | undefined) {
	return date ? format(date, "yyyy-MM-dd'T'HH:mm") : "";
}

/**
 * Minutes from midnight for a time-of-day `Date` (the calendar day is ignored).
 */
function timeToMinutes(time: Date) {
	return time.getHours() * 60 + time.getMinutes();
}

function minutesForStep(step: MinuteStep) {
	if (step === 60) {
		return [0];
	}

	return Array.from({ length: 60 / step }, (_, index) => index * step);
}

function dayEndMinutes(step: MinuteStep) {
	return 23 * 60 + (step === 60 ? 0 : 60 - step);
}

function minutesToHoursAndMinutes(minutes: number) {
	return {
		hours: Math.floor(minutes / 60),
		minutes: minutes % 60,
	};
}

function dateMinutes(date: Date) {
	return date.getHours() * 60 + date.getMinutes();
}

function snapMinutesToStep(
	minutes: number,
	method: "ceil" | "floor",
	step: MinuteStep,
) {
	return (
		(method === "ceil" ? Math.ceil(minutes / step) : Math.floor(minutes / step)) *
		step
	);
}

/**
 * Keeps `date` inside the allowed time-of-day window, snapped to `step`.
 */
function clampDateToTimeWindow(
	date: Date,
	minMinutes: number,
	maxMinutes: number,
	step: MinuteStep,
) {
	const currentMinutes = dateMinutes(date);
	const clamped = Math.min(maxMinutes, Math.max(minMinutes, currentMinutes));
	const snapped = snapMinutesToStep(clamped, "floor", step);
	const nextMinutes = Math.min(maxMinutes, Math.max(minMinutes, snapped));

	if (nextMinutes === currentMinutes) {
		return date;
	}

	const nextDate = new Date(date);
	const { hours, minutes } = minutesToHoursAndMinutes(nextMinutes);
	nextDate.setHours(hours, minutes, 0, 0);
	return nextDate;
}

function hourToStartMinutes(
	hour: number,
	is24hours: boolean,
	date: Date | undefined,
) {
	if (is24hours) {
		return hour * 60;
	}

	const isPm = date ? date.getHours() >= 12 : false;
	return ((hour % 12) + (isPm ? 12 : 0)) * 60;
}

function isTimeInWindow(minutes: number, minMinutes: number, maxMinutes: number) {
	return minutes >= minMinutes && minutes <= maxMinutes;
}

function isHourInWindow(
	hour: number,
	is24hours: boolean,
	date: Date | undefined,
	minMinutes: number,
	maxMinutes: number,
	minuteOptions: readonly number[],
) {
	const startMinutes = hourToStartMinutes(hour, is24hours, date);
	return minuteOptions.some((minute) =>
		isTimeInWindow(startMinutes + minute, minMinutes, maxMinutes),
	);
}

function isMinuteInWindow(
	minute: number,
	date: Date | undefined,
	hourValue: number | undefined,
	is24hours: boolean,
	minMinutes: number,
	maxMinutes: number,
) {
	if (date) {
		return isTimeInWindow(date.getHours() * 60 + minute, minMinutes, maxMinutes);
	}

	if (hourValue !== undefined) {
		return isTimeInWindow(
			hourToStartMinutes(hourValue, is24hours, date) + minute,
			minMinutes,
			maxMinutes,
		);
	}

	return HOURS_24.some((hour) =>
		isTimeInWindow(hour * 60 + minute, minMinutes, maxMinutes),
	);
}

function isMeridiemInWindow(
	meridiem: number,
	minMinutes: number,
	maxMinutes: number,
	step: MinuteStep,
) {
	const start = meridiem === 0 ? 0 : 12 * 60;
	const end = meridiem === 0 ? 12 * 60 - step : dayEndMinutes(step);
	return minMinutes <= end && maxMinutes >= start;
}

type TimeColumnProps = {
	values: readonly number[];
	selectedValue: number | undefined;
	onSelect: (value: number) => void;
	formatValue?: (value: number) => string;
	isOptionDisabled?: (value: number) => boolean;
	disabled?: boolean;
};

function TimeColumn({
	values,
	selectedValue,
	onSelect,
	formatValue = padTime,
	isOptionDisabled,
	disabled,
}: TimeColumnProps) {
	return (
		<ScrollArea className="h-full min-h-0 w-auto overflow-hidden">
			<div className="flex p-2 pb-4 sm:flex-col">
				{values.map((value) => (
					<Button
						key={value}
						type="button"
						size="icon"
						disabled={disabled || isOptionDisabled?.(value)}
						variant={selectedValue === value ? "default" : "ghost"}
						className="aspect-square size-9 shrink-0 tabular-nums active:scale-[0.96]"
						onClick={() => onSelect(value)}
					>
						{formatValue(value)}
					</Button>
				))}
			</div>
		</ScrollArea>
	);
}

type TimeBoundPickerProps = {
	label: string;
	date: Date | undefined;
	is24hours: boolean;
	minuteStep: MinuteStep;
	minMinutes: number;
	maxMinutes: number;
	onTimeChange: (type: TimePart, value: number) => void;
	disabled?: boolean;
};

function TimeBoundPicker({
	label,
	date,
	is24hours,
	minuteStep,
	minMinutes,
	maxMinutes,
	onTimeChange,
	disabled,
}: TimeBoundPickerProps) {
	const hourValue = date
		? is24hours
			? date.getHours()
			: date.getHours() % 12 || 12
		: undefined;
	const meridiemValue = date ? (date.getHours() < 12 ? 0 : 1) : undefined;
	const minuteOptions = minutesForStep(minuteStep);
	const showMinutes = minuteStep !== 60;

	return (
		<div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
			<p className="shrink-0 px-3 pt-2 pb-1 font-medium text-muted-foreground text-xs">
				{label}
			</p>
			<div className="flex min-h-0 flex-1 divide-x divide-border overflow-hidden">
				<TimeColumn
					values={is24hours ? HOURS_24 : HOURS_12}
					selectedValue={hourValue}
					onSelect={(hour) => onTimeChange("hour", hour)}
					formatValue={is24hours ? padTime : String}
					isOptionDisabled={(hour) =>
						!isHourInWindow(
							hour,
							is24hours,
							date,
							minMinutes,
							maxMinutes,
							minuteOptions,
						)
					}
					disabled={disabled}
				/>
				{showMinutes ? (
					<TimeColumn
						values={minuteOptions}
						selectedValue={date?.getMinutes()}
						onSelect={(minute) => onTimeChange("minute", minute)}
						isOptionDisabled={(minute) =>
							!isMinuteInWindow(
								minute,
								date,
								hourValue,
								is24hours,
								minMinutes,
								maxMinutes,
							)
						}
						disabled={disabled}
					/>
				) : null}
				{is24hours ? null : (
					<TimeColumn
						values={MERIDIEMS}
						selectedValue={meridiemValue}
						onSelect={(meridiem) => onTimeChange("ampm", meridiem)}
						formatValue={(value) => (value === 0 ? "AM" : "PM")}
						isOptionDisabled={(meridiem) =>
							!isMeridiemInWindow(meridiem, minMinutes, maxMinutes, minuteStep)
						}
						disabled={disabled}
					/>
				)}
			</div>
		</div>
	);
}

/**
 * Props for {@link DateTimePicker}.
 */
export type DateTimePickerProps = {
	/** Associates the trigger with a label via `htmlFor`. */
	id?: string;
	/**
	 * Base name for hidden inputs. Submits `${name}From` and `${name}To`
	 * as `yyyy-MM-dd'T'HH:mm` strings.
	 */
	name?: string;
	/** Overrides the start hidden input name. Defaults to `${name}From`. */
	nameFrom?: string;
	/** Overrides the end hidden input name. Defaults to `${name}To`. */
	nameTo?: string;
	/**
	 * Earliest selectable calendar day. Days before this date are disabled.
	 */
	from?: Date;
	/**
	 * Latest selectable calendar day. Days after this date are disabled.
	 */
	to?: Date;
	/**
	 * Earliest selectable time of day. The calendar day on this `Date` is ignored.
	 * Hours and minutes before this time cannot be chosen.
	 */
	fromTime?: Date;
	/**
	 * Latest selectable time of day. The calendar day on this `Date` is ignored.
	 * Hours and minutes after this time cannot be chosen.
	 */
	toTime?: Date;
	/** Controlled range. Omit together with `onChange` for uncontrolled use. */
	value?: DateTimeRange;
	/** Initial range when the picker is uncontrolled. */
	defaultValue?: DateTimeRange;
	/** Called whenever the start or end instant changes. */
	onChange?: (range: DateTimeRange) => void;
	/** Shown in the trigger when no start date is selected. */
	placeholder?: string;
	/**
	 * When `true`, hours are `00–23`. When `false`, hours are `1–12` with AM/PM.
	 * @default false
	 */
	is24hours?: boolean;
	/**
	 * Minute increment in the time lists. `60` hides the minutes column
	 * and snaps every selection to the hour.
	 * @default 5
	 */
	minuteStep?: MinuteStep;
	/**
	 * Allowed weekdays for calendar selection. `0` = Sunday … `6` = Saturday.
	 * Days outside this list are disabled.
	 */
	availableWeekdays?: number[];
	/** Earliest selectable instant — tightens times on that calendar day. */
	notBefore?: Date;
	/** Latest selectable instant — tightens times on that calendar day. */
	notAfter?: Date;
	/** Disables the trigger, calendar, and time lists. */
	disabled?: boolean;
	/** Extra classes for the trigger button. */
	className?: string;
};

/**
 * Popover picker for a date-time **range**.
 *
 * Select a start and end day on the calendar, then set From / To hours and
 * minutes. {@link DateTimePickerProps.minuteStep} controls 5, 15, 30, or
 * 60-minute increments (`60` hides minutes). {@link DateTimePickerProps.from}
 * and {@link DateTimePickerProps.to} limit which days can be chosen.
 * {@link DateTimePickerProps.fromTime} and {@link DateTimePickerProps.toTime}
 * limit which times of day can be chosen. {@link DateTimePickerProps.is24hours}
 * switches between 12-hour (default) and 24-hour clocks. If the selected end
 * is earlier than the start, the bounds are swapped so the range stays ordered.
 *
 * @example
 * ```tsx
 * <DateTimePicker
 *   id="session"
 *   name="session"
 *   from={new Date()}
 *   to={new Date("2026-12-31")}
 *   fromTime={new Date(0, 0, 0, 9, 0)}
 *   toTime={new Date(0, 0, 0, 17, 0)}
 *   minuteStep={15}
 *   is24hours={false}
 *   onChange={(range) => {
 *     console.log(range.from, range.to);
 *   }}
 * />
 * ```
 */
export function DateTimePicker({
	id,
	name,
	nameFrom,
	nameTo,
	from,
	to,
	fromTime,
	toTime,
	value,
	defaultValue,
	onChange,
	placeholder,
	is24hours = false,
	minuteStep = 5,
	availableWeekdays,
	notBefore,
	notAfter,
	disabled,
	className,
}: DateTimePickerProps) {
	const [uncontrolledValue, setUncontrolledValue] = React.useState<DateTimeRange>(
		defaultValue ?? EMPTY_RANGE,
	);
	const selected = value ?? uncontrolledValue;
	const fromName = nameFrom ?? (name ? `${name}From` : undefined);
	const toName = nameTo ?? (name ? `${name}To` : undefined);
	const displayValue = formatRange(selected, is24hours);
	const resolvedPlaceholder =
		placeholder ??
		(is24hours
			? "e.g. 09/12/2026 16:00 – 18:00"
			: "e.g. 09/12/2026 04:00 PM – 06:00 PM");
	const disabledDays = [
		{ before: startOfDay(new Date()) },
		...(from ? [{ before: startOfDay(from) }] : []),
		...(to ? [{ after: startOfDay(to) }] : []),
	];
	const isCalendarDayDisabled = (date: Date) => {
		const day = startOfDay(date);
		const today = startOfDay(new Date());
		if (day < today) return true;
		if (from && day < startOfDay(from)) return true;
		if (to && day.getTime() > startOfDay(to).getTime()) return true;
		if (
			availableWeekdays?.length &&
			!availableWeekdays.includes(date.getDay())
		) {
			return true;
		}
		return false;
	};
	const minTimeMinutes = fromTime
		? snapMinutesToStep(timeToMinutes(fromTime), "ceil", minuteStep)
		: 0;
	const maxTimeMinutes = toTime
		? snapMinutesToStep(timeToMinutes(toTime), "floor", minuteStep)
		: dayEndMinutes(minuteStep);
	const timeWindowStart = Math.min(minTimeMinutes, maxTimeMinutes);
	const timeWindowEnd = Math.max(minTimeMinutes, maxTimeMinutes);

	const getTimeBoundsForDate = (
		date: Date | undefined,
		bound: RangeBound,
	) => {
		let min = timeWindowStart;
		let max = timeWindowEnd;
		if (date && notBefore && isSameDay(date, notBefore)) {
			min = Math.max(
				min,
				snapMinutesToStep(dateMinutes(notBefore), "ceil", minuteStep),
			);
		}
		if (date && notAfter && isSameDay(date, notAfter)) {
			max = Math.min(
				max,
				snapMinutesToStep(dateMinutes(notAfter), "floor", minuteStep),
			);
		}
		if (
			bound === "to" &&
			date &&
			selected.from &&
			isSameDay(date, selected.from)
		) {
			min = Math.max(
				min,
				snapMinutesToStep(
					dateMinutes(selected.from) + minuteStep,
					"ceil",
					minuteStep,
				),
			);
		}
		return {
			min: Math.min(min, max),
			max: Math.max(min, max),
		};
	};

	const clampRange = (range: DateTimeRange): DateTimeRange => {
		const ordered = orderRange(range);
		const fromBounds = getTimeBoundsForDate(ordered.from, "from");
		const fromDate = ordered.from
			? clampDateToTimeWindow(
					ordered.from,
					fromBounds.min,
					fromBounds.max,
					minuteStep,
				)
			: undefined;

		const toDateInput = ordered.to ?? ordered.from;
		const toBounds = getTimeBoundsForDate(toDateInput, "to");
		let toDate = toDateInput
			? clampDateToTimeWindow(
					toDateInput,
					toBounds.min,
					toBounds.max,
					minuteStep,
				)
			: undefined;

		if (fromDate && toDate && toDate.getTime() <= fromDate.getTime()) {
			const bumped = new Date(fromDate);
			bumped.setMinutes(bumped.getMinutes() + minuteStep);
			toDate = clampDateToTimeWindow(
				bumped,
				toBounds.min,
				toBounds.max,
				minuteStep,
			);
		}

		return { from: fromDate, to: toDate };
	};

	const setSelected = (range: DateTimeRange) => {
		const nextRange = clampRange(range);
		if (value === undefined) {
			setUncontrolledValue(nextRange);
		}
		onChange?.(nextRange);
	};

	const handleDateSelect = (
		nextRange: { from?: Date; to?: Date } | undefined,
	) => {
		if (!nextRange?.from) {
			setSelected(EMPTY_RANGE);
			return;
		}

		setSelected({
			from: mergeDateWithTime(nextRange.from, selected.from),
			to: nextRange.to
				? mergeDateWithTime(nextRange.to, selected.to ?? selected.from)
				: undefined,
		});
	};

	const handleTimeChange = (
		bound: RangeBound,
		type: TimePart,
		nextValue: number,
	) => {
		const fallbackDate = selected.from ?? selected.to ?? new Date();
		const currentDate = selected[bound] ?? fallbackDate;
		setSelected({
			...selected,
			[bound]: applyTime(
				currentDate,
				type,
				nextValue,
				is24hours,
				minuteStep,
			),
		});
	};

	const [calendarHeight, setCalendarHeight] = React.useState<number>();
	const calendarObserverRef = React.useRef<ResizeObserver | null>(null);
	const calendarRef = React.useCallback((node: HTMLDivElement | null) => {
		calendarObserverRef.current?.disconnect();
		calendarObserverRef.current = null;

		if (!node) {
			return;
		}

		const updateHeight = () => {
			setCalendarHeight(node.getBoundingClientRect().height);
		};

		updateHeight();
		const observer = new ResizeObserver(updateHeight);
		observer.observe(node);
		calendarObserverRef.current = observer;
	}, []);

	return (
		<div className="relative">
			{fromName ? (
				<input type="hidden" name={fromName} value={toHiddenValue(selected.from)} />
			) : null}
			{toName ? (
				<input type="hidden" name={toName} value={toHiddenValue(selected.to)} />
			) : null}
			<Popover>
				<PopoverTrigger
					id={id}
					disabled={disabled}
					className={cn(
						"flex h-10 w-full items-center justify-between gap-1.5 whitespace-nowrap rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-left text-sm outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
						!displayValue && "text-muted-foreground",
						className,
					)}
				>
					<span className="flex-1 truncate tabular-nums">
						{displayValue ?? resolvedPlaceholder}
					</span>
					<CalendarClockIcon className="size-4 shrink-0 text-secondary" />
				</PopoverTrigger>
				<PopoverContent align="start" className="w-auto gap-0 overflow-hidden p-0">
					<div className="flex flex-col sm:flex-row">
						<div ref={calendarRef} className="shrink-0">
							<Calendar
								mode="range"
								selected={
									selected.from
										? { from: selected.from, to: selected.to }
										: undefined
								}
								onSelect={handleDateSelect}
								disabled={
									disabled ||
									(availableWeekdays?.length
										? isCalendarDayDisabled
										: disabledDays.length
											? disabledDays
											: undefined)
								}
							/>
						</div>
						<div
							className="flex min-h-0 flex-col divide-y divide-border overflow-hidden sm:flex-row sm:divide-x sm:divide-y-0"
							style={
								calendarHeight ? { height: calendarHeight } : undefined
							}
						>
							<TimeBoundPicker
								label="From"
								date={selected.from}
								is24hours={is24hours}
								minuteStep={minuteStep}
								minMinutes={getTimeBoundsForDate(selected.from, "from").min}
								maxMinutes={getTimeBoundsForDate(selected.from, "from").max}
								onTimeChange={(type, nextValue) =>
									handleTimeChange("from", type, nextValue)
								}
								disabled={disabled}
							/>
							<TimeBoundPicker
								label="To"
								date={selected.to}
								is24hours={is24hours}
								minuteStep={minuteStep}
								minMinutes={
									getTimeBoundsForDate(selected.to ?? selected.from, "to").min
								}
								maxMinutes={
									getTimeBoundsForDate(selected.to ?? selected.from, "to").max
								}
								onTimeChange={(type, nextValue) =>
									handleTimeChange("to", type, nextValue)
								}
								disabled={disabled}
							/>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export type DateTimeSinglePickerProps = {
	value?: Date;
	defaultValue?: Date;
	onChange?: (date: Date | undefined) => void;
	minuteStep?: MinuteStep;
	is24hours?: boolean;
	/** Latest selectable instant — disables later calendar days and times. */
	notAfter?: Date;
	disabled?: boolean;
	className?: string;
};

/**
 * Inline calendar + time picker for a single date-time (no popover).
 */
export function DateTimeSinglePicker({
	value,
	defaultValue,
	onChange,
	minuteStep = 15,
	is24hours = false,
	notAfter = new Date(),
	disabled,
	className,
}: DateTimeSinglePickerProps) {
	const [uncontrolledValue, setUncontrolledValue] = React.useState<Date | undefined>(
		defaultValue,
	);
	const selected = value ?? uncontrolledValue;

	const setSelected = (next: Date | undefined) => {
		if (value === undefined) {
			setUncontrolledValue(next);
		}
		onChange?.(next);
	};

	const getTimeBounds = (date: Date | undefined) => {
		const min = 0;
		let max = dayEndMinutes(minuteStep);
		if (date && notAfter && isSameDay(date, notAfter)) {
			max = Math.min(
				max,
				snapMinutesToStep(dateMinutes(notAfter), "floor", minuteStep),
			);
		}
		return {
			min,
			max: Math.max(min, max),
		};
	};

	const clampSelected = (date: Date) => {
		const bounds = getTimeBounds(date);
		return clampDateToTimeWindow(date, bounds.min, bounds.max, minuteStep);
	};

	const handleDateSelect = (date: Date | undefined) => {
		if (!date) return;
		setSelected(clampSelected(mergeDateWithTime(date, selected)));
	};

	const handleTimeChange = (type: TimePart, nextValue: number) => {
		if (!selected) return;
		const next = applyTime(selected, type, nextValue, is24hours, minuteStep);
		setSelected(clampSelected(next));
	};

	const [calendarHeight, setCalendarHeight] = React.useState<number>();
	const calendarObserverRef = React.useRef<ResizeObserver | null>(null);
	const calendarRef = React.useCallback((node: HTMLDivElement | null) => {
		calendarObserverRef.current?.disconnect();
		calendarObserverRef.current = null;

		if (!node) return;

		const updateHeight = () => {
			setCalendarHeight(node.getBoundingClientRect().height);
		};

		updateHeight();
		const observer = new ResizeObserver(updateHeight);
		observer.observe(node);
		calendarObserverRef.current = observer;
	}, []);

	const timeBounds = getTimeBounds(selected);

	return (
		<div
			className={cn(
				"flex w-fit flex-col overflow-hidden rounded-2xl border border-border/60 bg-background sm:flex-row",
				className,
			)}
		>
			<div ref={calendarRef} className="shrink-0">
				<Calendar
					mode="single"
					selected={selected}
					onSelect={handleDateSelect}
					disabled={
						disabled
							? true
							: [{ after: startOfDay(notAfter) }]
					}
				/>
			</div>
			<div
				className="flex min-h-0 min-w-0 flex-col overflow-hidden border-border border-t sm:border-t-0 sm:border-l"
				style={calendarHeight ? { height: calendarHeight } : undefined}
			>
				<TimeBoundPicker
					label="Time"
					date={selected}
					is24hours={is24hours}
					minuteStep={minuteStep}
					minMinutes={timeBounds.min}
					maxMinutes={timeBounds.max}
					onTimeChange={handleTimeChange}
					disabled={disabled || !selected}
				/>
			</div>
		</div>
	);
}
