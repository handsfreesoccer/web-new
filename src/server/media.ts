import {
	ASPECT_CLASS,
	type GalleryAspect,
	type GalleryMedia,
} from "#/lib/gallery";
import { getR2Config, getR2PublicUrl, R2_IMAGES_PREFIX, R2_VIDEOS_PREFIX } from "#/server/r2-config";
import { listR2Objects, type R2ObjectSummary } from "#/server/r2";

const ASPECTS = Object.keys(ASPECT_CLASS) as GalleryAspect[];
const IMAGE_FILENAME = /^(?:image|images)-(\d+)\.[a-z0-9]+$/i;
const VIDEO_FILENAME = /^video-(\d+)\.[a-z0-9]+$/i;

const normalizePrefix = (prefix: string) =>
	prefix.endsWith("/") ? prefix : `${prefix}/`;

const parseMediaFilename = (
	filename: string,
	kind: GalleryMedia["kind"],
) => {
	const match =
		kind === "image"
			? filename.match(IMAGE_FILENAME)
			: filename.match(VIDEO_FILENAME);
	if (!match?.[1]) return null;

	return {
		id: `${kind}-${match[1]}`,
		number: Number.parseInt(match[1], 10),
	};
};

const aspectForIndex = (index: number): GalleryAspect =>
	ASPECTS[index % ASPECTS.length] ?? "landscape";

const toGalleryMedia = (
	object: R2ObjectSummary,
	kind: GalleryMedia["kind"],
	prefix: string,
	index: number,
): GalleryMedia | null => {
	if (!object.Key) return null;

	const relative = object.Key.slice(prefix.length).replace(/^\/+/, "");
	if (relative.includes("/")) return null;

	const parsed = parseMediaFilename(relative, kind);
	if (!parsed) return null;

	const src = getR2PublicUrl(object.Key);
	if (!src) return null;

	const label = kind === "image" ? "Image" : "Video";

	return {
		id: parsed.id,
		kind,
		src,
		alt: `${label} ${parsed.number}`,
		aspect: aspectForIndex(index),
	};
};

const listFolderMedia = async (
	prefix: string,
	kind: GalleryMedia["kind"],
	startIndex: number,
) => {
	const objects = await listR2Objects(normalizePrefix(prefix));
	return objects
		.map((object, index) => toGalleryMedia(object, kind, normalizePrefix(prefix), startIndex + index))
		.filter((item): item is GalleryMedia => item !== null)
		.sort((a, b) => {
			const aNumber = Number.parseInt(a.id.split("-")[1] ?? "0", 10);
			const bNumber = Number.parseInt(b.id.split("-")[1] ?? "0", 10);
			return aNumber - bNumber;
		});
};

const sortGalleryMedia = (items: GalleryMedia[]) =>
	[...items].sort((a, b) => {
		if (a.kind !== b.kind) return a.kind === "image" ? -1 : 1;

		const aNumber = Number.parseInt(a.id.split("-")[1] ?? "0", 10);
		const bNumber = Number.parseInt(b.id.split("-")[1] ?? "0", 10);
		return aNumber - bNumber;
	});

export async function listGalleryMedia(): Promise<GalleryMedia[]> {
	const config = getR2Config();
	if (!config) return [];

	const images = await listFolderMedia(R2_IMAGES_PREFIX, "image", 0);
	const videos = await listFolderMedia(
		R2_VIDEOS_PREFIX,
		"video",
		images.length,
	);

	return sortGalleryMedia([...images, ...videos]);
}

export type SiteAssetMap = Record<string, string>;

export async function listSiteAssets(prefix: string): Promise<SiteAssetMap> {
	const config = getR2Config();
	if (!config) return {};

	const normalizedPrefix = normalizePrefix(prefix);
	const objects = await listR2Objects(normalizedPrefix);
	const assets: SiteAssetMap = {};

	for (const object of objects) {
		if (!object.Key) continue;

		const relative = object.Key.slice(normalizedPrefix.length).replace(/^\/+/, "");
		if (!relative || relative.includes("/")) continue;

		const name = relative.replace(/\.[^.]+$/, "");
		const url = getR2PublicUrl(object.Key);
		if (name && url) assets[name] = url;
	}

	return assets;
}
