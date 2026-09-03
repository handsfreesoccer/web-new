/**
 * Gallery media conventions:
 *   images/image-1.webp
 *   images/images-5.webp  (legacy plural prefix)
 *   videos/video-1.webm
 *
 * Page assets (optional, listed by prefix):
 *   home/hero.webp
 *   home/story-left.webp
 */
import { listGalleryMedia, listSiteAssets } from "#/server/media";
import {
	getR2Config,
	isR2Configured,
	R2_IMAGES_PREFIX,
	R2_VIDEOS_PREFIX,
} from "#/server/r2-config";

const prefix = process.argv[2];

if (!isR2Configured()) {
	console.error("R2 is not configured. Fill in the variables in .env.local first.");
	process.exit(1);
}

const config = getR2Config();
console.log(`Bucket: ${config?.bucketName}`);
console.log(`Public URL: ${config?.publicUrl}`);
console.log(`Images folder: ${R2_IMAGES_PREFIX}/`);
console.log(`Videos folder: ${R2_VIDEOS_PREFIX}/`);

if (prefix) {
	const assets = await listSiteAssets(prefix);
	console.log(`\nAssets under "${prefix}/":`);
	for (const [name, url] of Object.entries(assets)) {
		console.log(`- ${name}: ${url}`);
	}
	process.exit(0);
}

const gallery = await listGalleryMedia();
console.log(`\nGallery items (${gallery.length}):`);
for (const item of gallery) {
	console.log(`- [${item.kind}] ${item.id} (${item.aspect ?? "landscape"}): ${item.src}`);
}
