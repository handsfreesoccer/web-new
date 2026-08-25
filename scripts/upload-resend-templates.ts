import { readFile } from "node:fs/promises";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) throw new Error("RESEND_API_KEY is required");
const resend = new Resend(apiKey);
const templates = [
	["Hands Free Soccer welcome", "welcome.html", "We received your Hands Free Soccer booking"],
	["Hands Free Soccer payment link", "payment-link.html", "Your Hands Free Soccer payment link"],
	["Hands Free Soccer reminder", "reminder.html", "Your Hands Free Soccer appointment is tomorrow"],
	["Hands Free Soccer inquiry received", "contact-inquiry-received.html", "We received your Hands Free Soccer inquiry"],
] as const;
for (const [name, file, subject] of templates) {
	const html = await readFile(new URL(`../email-templates/${file}`, import.meta.url), "utf8");
	const result = await resend.templates.create({ name, subject, html });
	if (result.error) throw new Error(`${name}: ${result.error.message}`);
	console.log(`${name}: ${result.data?.id ?? "created"}`);
}
