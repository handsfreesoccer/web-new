export const ASPECT_CLASS = {
	landscape: "aspect-[4/3]",
	portrait: "aspect-[3/4]",
	square: "aspect-square",
	wide: "aspect-video",
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
	{ id: "featured-skeleton-landscape-1", aspect: "landscape" },
	{ id: "featured-skeleton-wide-1", aspect: "wide" },
	{ id: "featured-skeleton-landscape-2", aspect: "landscape" },
	{ id: "featured-skeleton-wide-2", aspect: "wide" },
	{ id: "featured-skeleton-portrait-1", aspect: "portrait" },
	{ id: "featured-skeleton-square-1", aspect: "square" },
	{ id: "featured-skeleton-landscape-3", aspect: "landscape" },
];

export const MORE_GALLERY_SKELETONS: Array<{
	id: string;
	aspect: GalleryAspect;
}> = [
	{ id: "more-skeleton-portrait-1", aspect: "portrait" },
	{ id: "more-skeleton-wide-1", aspect: "wide" },
	{ id: "more-skeleton-landscape-1", aspect: "landscape" },
	{ id: "more-skeleton-square-1", aspect: "square" },
	{ id: "more-skeleton-landscape-2", aspect: "landscape" },
	{ id: "more-skeleton-portrait-2", aspect: "portrait" },
	{ id: "more-skeleton-wide-2", aspect: "wide" },
	{ id: "more-skeleton-landscape-3", aspect: "landscape" },
];
