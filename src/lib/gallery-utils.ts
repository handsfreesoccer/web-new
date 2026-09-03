import type { GalleryMedia } from "#/lib/gallery";

export const FEATURED_VIDEO_COUNT = 4;
export const FEATURED_IMAGE_COUNT = 3;

export const resolveGalleryItems = (items: GalleryMedia[] | undefined) =>
	items ?? [];

const byMediaNumber = (a: GalleryMedia, b: GalleryMedia) => {
	const aNumber = Number.parseInt(a.id.split("-")[1] ?? "0", 10);
	const bNumber = Number.parseInt(b.id.split("-")[1] ?? "0", 10);
	return aNumber - bNumber;
};

export function splitGalleryItems(items: GalleryMedia[]) {
	const videos = items.filter((item) => item.kind === "video").sort(byMediaNumber);
	const images = items.filter((item) => item.kind === "image").sort(byMediaNumber);

	const featured = [
		...videos.slice(0, FEATURED_VIDEO_COUNT),
		...images.slice(0, FEATURED_IMAGE_COUNT),
	];

	const featuredIds = new Set(featured.map((item) => item.id));
	const more = items
		.filter((item) => !featuredIds.has(item.id))
		.sort((a, b) => {
			if (a.kind !== b.kind) return a.kind === "video" ? -1 : 1;
			return byMediaNumber(a, b);
		});

	return { featured, more, all: items };
}
