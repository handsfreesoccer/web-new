import { useQuery } from "@tanstack/react-query";
import api from "#/api/http/xhr";
import type { V2SuccessResponse } from "#/api/http/shared";
import { unwrapV2Data } from "#/api/http/shared";
import {
	DEFAULT_BOOKING_AVAILABILITY,
	type BookingAvailability,
} from "#/lib/booking-availability-schema";

export const bookingAvailabilityQueryKey = ["booking-availability"] as const;

export function useBookingAvailability() {
	return useQuery({
		queryKey: bookingAvailabilityQueryKey,
		queryFn: async () => {
			const response = await api.get<V2SuccessResponse<BookingAvailability>>(
				"/booking-availability",
			);
			return unwrapV2Data(response);
		},
		staleTime: 60 * 1000,
		placeholderData: DEFAULT_BOOKING_AVAILABILITY,
	});
}
