import { StatusCodes } from "http-status-codes";

export type ErrorResponse = {
	success: false;
	message: string;
	errors: string[];
	external_error: boolean;
	status_code: number;
};

export const success = <T>(data: T, message: string, status = 200) =>
	Response.json({ success: true, message, data }, { status });

export const failure = (
	message: string,
	status = StatusCodes.BAD_REQUEST,
	errors: string[] = [message],
	externalError = false,
) =>
	Response.json(
		{
			success: false,
			message,
			errors,
			external_error: externalError,
			status_code: status,
		},
		{ status },
	);

export const jsonBody = async <T>(request: Request) => {
	try {
		return { value: (await request.json()) as T };
	} catch {
		return { error: failure("Request body must be valid JSON.") };
	}
};
