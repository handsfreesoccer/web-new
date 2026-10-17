export const ASPECT_CLASS = {
	landscape: "aspect-[4/3]",
	portrait: "aspect-[3/4]",
	square: "aspect-square",
	wide: "aspect-video",
	tall: "aspect-[9/16]",
} as const;

export type GalleryAspect = keyof typeof ASPECT_CLASS;

export type GalleryMedia = {
	id: string;
	src: string;
	alt: string;
	kind: "image" | "video";
	poster?: string;
	aspect?: GalleryAspect;
};

/** Placeholder masonry shapes shown while gallery media loads from R2. */
export const FEATURED_GALLERY_SKELETONS: Array<{
	id: string;
	aspect: GalleryAspect;
}> = [
	{ id: "featured-skeleton-tall-1", aspect: "tall" },
	{ id: "featured-skeleton-tall-2", aspect: "tall" },
	{ id: "featured-skeleton-tall-3", aspect: "tall" },
	{ id: "featured-skeleton-tall-4", aspect: "tall" },
	{ id: "featured-skeleton-portrait-1", aspect: "portrait" },
	{ id: "featured-skeleton-portrait-2", aspect: "portrait" },
	{ id: "featured-skeleton-portrait-3", aspect: "portrait" },
];

export const MORE_GALLERY_SKELETONS: Array<{
	id: string;
	aspect: GalleryAspect;
}> = [
	{ id: "more-skeleton-tall-1", aspect: "tall" },
	{ id: "more-skeleton-tall-2", aspect: "tall" },
	{ id: "more-skeleton-tall-3", aspect: "tall" },
	{ id: "more-skeleton-tall-4", aspect: "tall" },
	{ id: "more-skeleton-tall-5", aspect: "tall" },
	{ id: "more-skeleton-tall-6", aspect: "tall" },
	{ id: "more-skeleton-portrait-1", aspect: "portrait" },
	{ id: "more-skeleton-portrait-2", aspect: "portrait" },
];
