import { useQuery } from "@tanstack/react-query";
import {
	fetchGalleryMedia,
	fetchSiteAssets,
	mediaQueryKeys,
} from "#/lib/media-api";

export function useGalleryMedia() {
	return useQuery({
		queryKey: mediaQueryKeys.gallery,
		queryFn: fetchGalleryMedia,
		staleTime: 5 * 60 * 1000,
	});
}

export function useSiteAssets(prefix: string) {
	return useQuery({
		queryKey: mediaQueryKeys.assets(prefix),
		queryFn: () => fetchSiteAssets(prefix),
		staleTime: 5 * 60 * 1000,
		placeholderData: {},
	});
}

export function useSiteAssetUrl(
	prefix: string,
	name: string,
	fallback: string,
) {
	const { data } = useSiteAssets(prefix);
	return data?.[name] ?? fallback;
}
