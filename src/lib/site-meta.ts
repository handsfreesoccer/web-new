export const SITE_NAME = "HandsFree Soccer Academy";

export const SITE_DESCRIPTION =
	"Personalized 1:1 and small group soccer training for kids ages 6–18 in Allen, McKinney, Melissa, and Princeton, TX.";

export const SITE_IMAGE_PATH = "/brand/logo.png";

export const pageTitle = (page: string) => `${page} | ${SITE_NAME}`;

export const defaultPageTitle = SITE_NAME;

const trimSlash = (value: string) => value.replace(/\/+$/, "");

export function siteOrigin() {
	return trimSlash(
		process.env.APP_URL?.trim() ||
			process.env.SITE_URL?.trim() ||
			(typeof window !== "undefined" ? window.location.origin : "") ||
			"",
	);
}

export function siteImageUrl() {
	const origin = siteOrigin();
	return origin ? `${origin}${SITE_IMAGE_PATH}` : SITE_IMAGE_PATH;
}

type PageMetaOptions = {
	title?: string;
	description?: string;
};

export function pageMeta({
	title = defaultPageTitle,
	description = SITE_DESCRIPTION,
}: PageMetaOptions = {}) {
	const image = siteImageUrl();
	return [
		{ title },
		{ name: "description", content: description },
		{ property: "og:type", content: "website" },
		{ property: "og:site_name", content: SITE_NAME },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:image", content: image },
		{ property: "og:image:alt", content: `${SITE_NAME} logo` },
		{ property: "og:image:type", content: "image/png" },
		{ property: "og:image:width", content: "512" },
		{ property: "og:image:height", content: "512" },
		{ name: "twitter:card", content: "summary" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: image },
		{ name: "twitter:image:alt", content: `${SITE_NAME} logo` },
	];
}
