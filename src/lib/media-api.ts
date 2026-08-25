import type { V2SuccessResponse } from "#/api/http/shared";
import api from "#/api/http/xhr";
import { unwrapV2Data } from "#/api/http/shared";
import type { GalleryMedia } from "#/lib/gallery";

export type SiteAssetMap = Record<string, string>;

export const mediaQueryKeys = {
	gallery: ["media", "gallery"] as const,
	assets: (prefix: string) => ["media", "assets", prefix] as const,
};

export async function fetchGalleryMedia() {
	const response =
		await api.get<V2SuccessResponse<GalleryMedia[]>>("/media/gallery");
	return unwrapV2Data(response);
}

export async function fetchSiteAssets(prefix: string) {
	const response = await api.get<V2SuccessResponse<SiteAssetMap>>(
		"/media/assets",
		{
			params: { prefix },
		},
	);
	return unwrapV2Data(response);
}
