import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import api from "#/api/http/xhr";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "#/components/ui/input-otp";
import { Label } from "#/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({ component: LoginPage });

function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("handsfreesoccer@gmail.com");
	const [code, setCode] = useState("");
	const [codeSent, setCodeSent] = useState(false);
	const [loading, setLoading] = useState(false);
	const linkCode = new URLSearchParams(
		typeof window === "undefined" ? "" : window.location.search,
	).get("code");

	useEffect(() => {
		if (!linkCode) return;
		setCode(linkCode);
		void verifyCode(linkCode);
	}, [linkCode]);

	async function verifyCode(value = code) {
		if (!/^\d{6}$/.test(value)) {
			toast.error("Enter the six-digit code from your email.");
			return;
		}
		setLoading(true);
		try {
			const response = await api.get<{
				success: boolean;
				data: { accessToken: string };
			}>(`/admin/auth/verify?code=${encodeURIComponent(value)}`);
			localStorage.setItem("hfs_access_token", response.data.data.accessToken);
			await navigate({ to: "/admin" });
		} catch {
			toast.error("This code is invalid or expired.");
			setLoading(false);
		}
	}

	async function requestCode() {
		setLoading(true);
		try {
			const response = await api.post("/admin/auth/request-link", { email });
			setLoading(false);
			if (!response.data.success) {
				toast.error(response.data.message);
				return;
			}
			setCodeSent(true);
			toast.success("Check your email for the six-digit code.");
			if (response.data.data.previewCode)
				toast.info(`Your magic code is ${response.data.data.previewCode}`);
		} catch {
			setLoading(false);
			toast.error("Could not request a magic code.");
		}
	}

	return (
		<main className="grid min-h-screen place-items-center bg-[var(--bg-base)] px-4">
			<div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
				<p className="font-bold text-primary text-sm tracking-[.16em]">
					HANDS FREE SOCCER
				</p>
				{codeSent ? (
					<>
						<h1 className="mt-4 font-bold text-4xl text-secondary">
							Enter your code
						</h1>
						<p className="mt-2 text-muted-foreground">
							We sent a six-digit code to {email}.
						</p>
						<div className="mt-8 flex flex-col gap-3">
							<Label htmlFor="admin-code">Verification code</Label>
							<InputOTP
								id="admin-code"
								maxLength={6}
								value={code}
								onChange={setCode}
								autoFocus
							>
								<InputOTPGroup>
									{[0, 1, 2, 3, 4, 5].map((index) => (
										<InputOTPSlot key={index} index={index} />
									))}
								</InputOTPGroup>
							</InputOTP>
						</div>
						<Button
							className="mt-6 w-full"
							disabled={loading || code.length !== 6}
							onClick={() => void verifyCode()}
						>
							{loading ? "Verifying..." : "Verify code"}
						</Button>
						<Button
							variant="ghost"
							className="mt-2 w-full"
							onClick={() => setCodeSent(false)}
						>
							Use a different email
						</Button>
					</>
				) : (
					<>
						<h1 className="mt-4 font-bold text-4xl text-secondary">
							Admin login
						</h1>
						<p className="mt-2 text-muted-foreground">
							Request a secure six-digit code to manage students.
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
							onClick={() => void requestCode()}
						>
							{loading ? "Sending..." : "Email me a code"}
						</Button>
					</>
				)}
			</div>
		</main>
	);
}
