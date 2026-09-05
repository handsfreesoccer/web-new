import templateRegistry from "../../email-templates/resend-template-ids.json";

export type ResendTemplateName =
	| "booking-welcome"
	| "payment-link"
	| "appointment-reminder"
	| "contact-inquiry-received"
	| "contact-inquiry-notification"
	| "admin-sign-in";

type TemplateRecord = {
	name: ResendTemplateName;
	id: string;
	alias: string;
	published: boolean;
	variables: string[];
};

const templates = templateRegistry as TemplateRecord[];

const templateMap = new Map(
	templates.map((template) => [template.name, template.id]),
);

export function getResendTemplateId(name: ResendTemplateName) {
	const id = templateMap.get(name);
	if (!id) {
		throw new Error(
			`Resend template "${name}" is not registered. Run: bun run resend:templates`,
		);
	}
	return id;
}

export const currentYear = () => new Date().getFullYear();
