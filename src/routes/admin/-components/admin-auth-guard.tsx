import { useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import api from "#/api/http/xhr";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const [authenticated, setAuthenticated] = useState(false);

	useEffect(() => {
		let active = true;
		const check = async () => {
			if (!localStorage.getItem("hfs_access_token")) {
				try {
					const response = await api.post<{ data: { accessToken: string } }>(
						"/admin/auth/refresh",
					);
					localStorage.setItem(
						"hfs_access_token",
						response.data.data.accessToken,
					);
				} catch {
					await navigate({ to: "/admin/login" });
					return;
				}
			}
			if (active) setAuthenticated(true);
		};
		void check();
		return () => {
			active = false;
		};
	}, [navigate]);

	if (!authenticated)
		return (
			<main className="grid min-h-screen place-items-center bg-(--bg-base)">
				<LoaderCircle
					className="size-8 animate-spin text-primary"
					aria-label="Checking authentication"
				/>
			</main>
		);
	return children;
}
