import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({ component: LoginPage });

function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("handsfreesoccer@gmail.com");
	const [loading, setLoading] = useState(false);
	const token = new URLSearchParams(
		typeof window === "undefined" ? "" : window.location.search,
	).get("token");
	if (token)
		void fetch(
			`/api/admin/auth/verify?token=${encodeURIComponent(token)}`,
		).then(async (response) => {
			const result = await response.json();
			if (response.ok && result.success) {
				localStorage.setItem("hfs_access_token", result.data.accessToken);
				await navigate({ to: "/admin" });
			}
		});
	async function requestLink() {
		setLoading(true);
		const response = await fetch("/api/admin/auth/request-link", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});
		const result = await response.json();
		setLoading(false);
		if (!response.ok) toast.error(result.message);
		else {
			toast.success("Check your email for the magic link.");
			if (result.data.previewUrl) toast.info(result.data.previewUrl);
		}
	}
	return (
		<main className="grid min-h-screen place-items-center bg-[var(--bg-base)] px-4">
			<div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
				<p className="font-bold text-primary text-sm tracking-[.16em]">
					HANDS FREE SOCCER
				</p>
				<h1 className="mt-4 font-bold text-4xl text-secondary">Admin login</h1>
				<p className="mt-2 text-muted-foreground">
					Request a secure magic link to manage students.
				</p>
				<div className="mt-8 flex flex-col gap-2">
					<Label htmlFor="admin-email">Admin email</Label>
					<Input
						id="admin-email"
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
				</div>
				<Button
					className="mt-6 w-full"
					disabled={loading}
					onClick={() => void requestLink()}
				>
					{loading ? "Sending..." : "Email me a magic link"}
				</Button>
			</div>
		</main>
	);
}
