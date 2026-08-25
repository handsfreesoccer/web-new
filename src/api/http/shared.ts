import type { AxiosError, AxiosResponse } from "axios";

export interface V2ErrorResponse {
	success: false;
	message: string;
	errors: string[];
	external_error: boolean;
	status_code: number;
}
export interface V2SuccessResponse<TData, TMeta = undefined> {
	success: true;
	message: string;
	data: TData;
	meta?: TMeta;
}
export interface V2Pagination {
	current_page: number;
	total_pages: number;
	total: number;
	per_page: number;
	from?: number;
	to?: number;
}
export interface V2PaginationMeta {
	pagination: V2Pagination;
}
export type V2PaginatedSuccessResponse<TItem> = V2SuccessResponse<
	TItem[],
	V2PaginationMeta
>;
export type V2AxiosError = AxiosError<V2ErrorResponse>;
export const DEFAULT_API_ERROR_MESSAGE =
	"An error occurred. Kindly contact your admin.";
export const getV2ErrorMessage = (
	error: unknown,
	fallback = DEFAULT_API_ERROR_MESSAGE,
) =>
	(error as V2AxiosError).response?.data?.errors?.[0] ??
	(error as V2AxiosError).response?.data?.message ??
	fallback;
export const unwrapV2Data = <T>(
	response: AxiosResponse<V2SuccessResponse<T>>,
) => response.data.data;
