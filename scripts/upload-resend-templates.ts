import { readFile, writeFile } from "node:fs/promises";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) throw new Error("RESEND_API_KEY is required");

const resend = new Resend(apiKey);

const templates = [
	["booking-welcome", "booking-welcome.html", "We received your Hands Free Soccer booking"],
	["payment-link", "payment-link.html", "Hands Free Soccer — payment for your session"],
	[
		"appointment-reminder",
		"appointment-reminder.html",
		"Your Hands Free Soccer appointment is tomorrow",
	],
	[
		"contact-inquiry-received",
		"contact-inquiry-received.html",
		"We received your Hands Free Soccer inquiry",
	],
	["admin-sign-in", "admin-sign-in.html", "Your Hands Free Soccer admin sign-in link"],
] as const;

const extractVariables = (html: string) => {
	const matches = html.match(/\{\{\{\s*([a-z0-9_]+)\s*\}\}\}/gi) ?? [];
	return [...new Set(matches.map((token) => token.replace(/[{}\s]/g, "")))].sort();
};

const toTemplateVariables = (keys: string[]) =>
	keys.map((key) => ({
		key,
		type: key === "year" ? ("number" as const) : ("string" as const),
		...(key === "year" ? { fallbackValue: new Date().getFullYear() } : {}),
	}));

const registryPath = new URL(
	"../email-templates/resend-template-ids.json",
	import.meta.url,
);

const listExistingTemplates = async () => {
	const listed = await resend.templates.list({ limit: 100 });
	if (listed.error) throw new Error(listed.error.message);
	return listed.data?.data ?? [];
};

const upsertTemplate = async (
	alias: (typeof templates)[number][0],
	subject: string,
	html: string,
) => {
	const variables = toTemplateVariables(extractVariables(html));
	const existing = (await listExistingTemplates()).find(
		(template) => template.name === alias || template.alias === alias,
	);

	if (existing) {
		const updated = await resend.templates.update(existing.id, {
			name: alias,
			subject,
			html,
			variables,
		});
		if (updated.error) throw new Error(`${alias}: ${updated.error.message}`);

		const published = await resend.templates.publish(existing.id);
		if (published.error) throw new Error(`${alias}: ${published.error.message}`);

		return existing.id;
	}

	const created = await resend.templates
		.create({ name: alias, subject, html, variables })
		.publish();
	if (created.error) throw new Error(`${alias}: ${created.error.message}`);

	return created.data?.id;
};

const results = [];

for (const [alias, file, subject] of templates) {
	const html = await readFile(
		new URL(`../email-templates/${file}`, import.meta.url),
		"utf8",
	);
	const id = await upsertTemplate(alias, subject, html);
	results.push({
		name: alias,
		id,
		alias,
		published: true,
		variables: extractVariables(html),
	});
	console.log(`${alias}: ${id}`);
}

await writeFile(registryPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log(`Saved ${results.length} templates to email-templates/resend-template-ids.json`);
