import axios from "axios";
import { StatusCodes } from "http-status-codes";
import type { V2SuccessResponse } from "#/api/http/shared";

const http = axios.create({
	baseURL: "/api",
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});
http.interceptors.request.use((config) => {
	const token =
		typeof window !== "undefined"
			? localStorage.getItem("hfs_access_token")
			: null;
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});
let refreshing: Promise<string> | null = null;
http.interceptors.response.use(
	(response) => response,
	async (error) => {
		const request = error.config;
		if (error.response?.status !== StatusCodes.UNAUTHORIZED || request?._retry)
			return Promise.reject(error);
		request._retry = true;
		refreshing ??= http
			.post<V2SuccessResponse<{ accessToken: string }>>("/admin/auth/refresh")
			.then((response) => {
				const token = response.data.data.accessToken;
				localStorage.setItem("hfs_access_token", token);
				return token;
			})
			.finally(() => {
				refreshing = null;
			});
		try {
			const token = await refreshing;
			request.headers.Authorization = `Bearer ${token}`;
			return http(request);
		} catch {
			localStorage.removeItem("hfs_access_token");
			return Promise.reject(error);
		}
	},
);
export default http;
