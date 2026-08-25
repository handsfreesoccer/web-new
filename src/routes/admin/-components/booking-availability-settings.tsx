import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

	useEffect(() => {
		if (!availabilityQuery.data) return;
		setAvailableDays(availabilityQuery.data.availableDays);
		setStartTime(availabilityQuery.data.startTime);
		setEndTime(availabilityQuery.data.endTime);
		setMinuteStep(availabilityQuery.data.minuteStep);
		setMinNoticeHours(
			availabilityQuery.data.minNoticeHours ??
				DEFAULT_BOOKING_AVAILABILITY.minNoticeHours,
		);
		setMaxAdvanceDays(
			availabilityQuery.data.maxAdvanceDays ??
				DEFAULT_BOOKING_AVAILABILITY.maxAdvanceDays,
		);
	}, [availabilityQuery.data]);

	const saveMutation = useMutation({
		mutationFn: (payload: BookingAvailability) =>
			api.put("/admin/booking-availability", payload),
		onSuccess: () => {
			toast.success("Booking availability updated.");
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

	const buildPayload = (): BookingAvailability => ({
		availableDays,
		startTime,
		endTime,
		minuteStep,
		minNoticeHours:
			Number.isFinite(minNoticeHours) && minNoticeHours > 0
				? minNoticeHours
				: DEFAULT_BOOKING_AVAILABILITY.minNoticeHours,
		maxAdvanceDays:
			Number.isFinite(maxAdvanceDays) && maxAdvanceDays > 0
				? maxAdvanceDays
				: DEFAULT_BOOKING_AVAILABILITY.maxAdvanceDays,
	});
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

				<Button
					className="w-fit"
					disabled={saveMutation.isPending || availabilityQuery.isLoading}
					onClick={() => void saveMutation.mutateAsync(buildPayload())}
				>
					{saveMutation.isPending ? "Saving..." : "Save availability"}
				</Button>
			</div>
		</section>
	);
}
