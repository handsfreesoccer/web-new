import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import api from "#/api/http/xhr";
import type { V2SuccessResponse } from "#/api/http/shared";
import { unwrapV2Data } from "#/api/http/shared";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	DEFAULT_BOOKING_AVAILABILITY,
	type BookingAvailability,
	formatWeekday,
	MINUTE_STEPS,
	sortWeekdays,
	WEEKDAYS,
	type Weekday,
} from "#/lib/booking-availability-schema";
import { bookingAvailabilityQueryKey } from "#/hooks/use-booking-availability";
import { cn } from "#/lib/utils";

function toComparablePayload(
	data: Pick<
		BookingAvailability,
		| "availableDays"
		| "startTime"
		| "endTime"
		| "minuteStep"
		| "minNoticeHours"
		| "maxAdvanceDays"
	>,
): BookingAvailability {
	return {
		availableDays: sortWeekdays(data.availableDays),
		startTime: data.startTime,
		endTime: data.endTime,
		minuteStep: data.minuteStep,
		minNoticeHours:
			Number.isFinite(data.minNoticeHours) && data.minNoticeHours > 0
				? data.minNoticeHours
				: DEFAULT_BOOKING_AVAILABILITY.minNoticeHours,
		maxAdvanceDays:
			Number.isFinite(data.maxAdvanceDays) && data.maxAdvanceDays > 0
				? data.maxAdvanceDays
				: DEFAULT_BOOKING_AVAILABILITY.maxAdvanceDays,
	};
}

function availabilityPayloadsEqual(a: BookingAvailability, b: BookingAvailability) {
	return (
		a.startTime === b.startTime &&
		a.endTime === b.endTime &&
		a.minuteStep === b.minuteStep &&
		a.minNoticeHours === b.minNoticeHours &&
		a.maxAdvanceDays === b.maxAdvanceDays &&
		a.availableDays.length === b.availableDays.length &&
		a.availableDays.every((day, index) => day === b.availableDays[index])
	);
}

export function BookingAvailabilitySettings() {
	const queryClient = useQueryClient();
	const availabilityQuery = useQuery({
		queryKey: ["admin-booking-availability"],
		queryFn: async () => {
			const response = await api.get<V2SuccessResponse<BookingAvailability>>(
				"/admin/booking-availability",
			);
			return unwrapV2Data(response);
		},
	});
	const [availableDays, setAvailableDays] = useState<Weekday[]>([]);
	const [startTime, setStartTime] = useState("09:00");
	const [endTime, setEndTime] = useState("17:00");
	const [minuteStep, setMinuteStep] = useState<BookingAvailability["minuteStep"]>(30);
	const [minNoticeHours, setMinNoticeHours] = useState(24);
	const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
	const [lastSavedPayload, setLastSavedPayload] =
		useState<BookingAvailability | null>(null);

	useEffect(() => {
		if (!availabilityQuery.data) return;
		const payload = toComparablePayload(availabilityQuery.data);
		setLastSavedPayload(payload);
		setAvailableDays(payload.availableDays);
		setStartTime(payload.startTime);
		setEndTime(payload.endTime);
		setMinuteStep(payload.minuteStep);
		setMinNoticeHours(payload.minNoticeHours);
		setMaxAdvanceDays(payload.maxAdvanceDays);
	}, [availabilityQuery.data]);

	const saveMutation = useMutation({
		mutationFn: (payload: BookingAvailability) =>
			api.put("/admin/booking-availability", payload),
		onSuccess: (_data, payload) => {
			toast.success("Booking availability updated.");
			setLastSavedPayload(toComparablePayload(payload));
			void queryClient.invalidateQueries({
				queryKey: ["admin-booking-availability"],
			});
			void queryClient.invalidateQueries({
				queryKey: bookingAvailabilityQueryKey,
			});
		},
		onError: (error) => {
			const result = (error as { response?: { data?: { message?: string } } })
				.response?.data;
			toast.error(result?.message ?? "Could not save booking availability.");
		},
	});

	const currentPayload = useMemo(
		() =>
			toComparablePayload({
				availableDays,
				startTime,
				endTime,
				minuteStep,
				minNoticeHours,
				maxAdvanceDays,
			}),
		[
			availableDays,
			startTime,
			endTime,
			minuteStep,
			minNoticeHours,
			maxAdvanceDays,
		],
	);

	const isDirty =
		lastSavedPayload !== null &&
		!availabilityPayloadsEqual(lastSavedPayload, currentPayload);

	const toggleDay = (day: Weekday) => {
		setAvailableDays((current) =>
			current.includes(day)
				? current.filter((value) => value !== day)
				: sortWeekdays([...current, day]),
		);
	};

	return (
		<section className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
			<div className="flex flex-col gap-2">
				<h2 className="font-bold text-xl text-secondary">Booking availability</h2>
				<p className="text-muted-foreground text-sm">
					Choose which days and time windows appear on the public booking form.
				</p>
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-3">
					<Label>Available days</Label>
					<div className="flex flex-wrap gap-2">
						{WEEKDAYS.map((day) => {
							const selected = availableDays.includes(day);
							return (
								<Button
									key={day}
									type="button"
									size="sm"
									variant={selected ? "default" : "outline"}
									className={cn("rounded-full capitalize", selected && "text-white")}
									onClick={() => toggleDay(day)}
								>
									{formatWeekday(day, "short")}
								</Button>
							);
						})}
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<div className="flex flex-col gap-2">
						<Label htmlFor="availability-start">Start time</Label>
						<Input
							id="availability-start"
							type="time"
							value={startTime}
							onChange={(event) => setStartTime(event.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="availability-end">End time</Label>
						<Input
							id="availability-end"
							type="time"
							value={endTime}
							onChange={(event) => setEndTime(event.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="availability-step">Time interval</Label>
						<Select
							value={String(minuteStep)}
							onValueChange={(value) =>
								setMinuteStep(Number(value) as BookingAvailability["minuteStep"])
							}
						>
							<SelectTrigger id="availability-step" className="w-full">
								<SelectValue placeholder="Interval" />
							</SelectTrigger>
							<SelectContent>
								{MINUTE_STEPS.map((step) => (
									<SelectItem key={step} value={String(step)}>
										Every {step} minutes
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="flex flex-col gap-2">
						<Label htmlFor="availability-notice">
							Minimum notice (hours)
						</Label>
						<Input
							id="availability-notice"
							type="number"
							min={1}
							max={168}
							value={minNoticeHours}
							onChange={(event) =>
								setMinNoticeHours(Number(event.target.value))
							}
						/>
						<p className="text-muted-foreground text-xs">
							How far in advance someone must book (e.g. 24 = no same-day
							bookings).
						</p>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="availability-advance">
							Maximum advance (days)
						</Label>
						<Input
							id="availability-advance"
							type="number"
							min={1}
							max={365}
							value={maxAdvanceDays}
							onChange={(event) =>
								setMaxAdvanceDays(Number(event.target.value))
							}
						/>
						<p className="text-muted-foreground text-xs">
							How far ahead the calendar stays open (e.g. 30 = one month out).
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button
						className="w-fit"
						disabled={
							!isDirty || saveMutation.isPending || availabilityQuery.isLoading
						}
						onClick={() => void saveMutation.mutateAsync(currentPayload)}
					>
						{saveMutation.isPending ? "Saving..." : "Save availability"}
					</Button>
					{isDirty ? (
						<p className="text-muted-foreground text-sm">Unsaved changes</p>
					) : null}
				</div>
			</div>
		</section>
	);
}
