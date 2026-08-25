import type React from "react";
import { GalleryPlaybackBoundary } from "#/components/gallery/gallery-playback";
import { GalleryMasonryItem } from "#/components/gallery/gallery-masonry-item";
import { MediaGalleryBoundary } from "#/components/gallery/media-gallery-lightbox";
import { useGalleryMedia } from "#/hooks/use-media";
import { GALLERY_MORE_SECTION_ID } from "#/lib/constants";
import { resolveGalleryItems, splitGalleryItems } from "#/lib/gallery-utils";
import { useHashScroll } from "#/lib/use-hash-scroll";

export const MoreFromTheGallery: React.FC = () => {
	useHashScroll(GALLERY_MORE_SECTION_ID);
	const { data: galleryItems } = useGalleryMedia();
	const { more } = splitGalleryItems(resolveGalleryItems(galleryItems));

	return (
		<GalleryPlaybackBoundary items={more}>
			<MediaGalleryBoundary items={more}>
			<section
				id={GALLERY_MORE_SECTION_ID}
				className="mx-auto flex scroll-mt-28 flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16"
			>
				<div className="w-full max-w-360">
					<div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
						<header className="mb-6 break-inside-avoid">
							<div className="flex flex-col items-start gap-6">
								<div className="flex items-center gap-2">
									<span className="relative flex size-2">
										<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
										<span className="relative size-2 rounded-full bg-primary" />
									</span>
									<p className="font-medium text-base">Gallery</p>
								</div>
								<div className="flex flex-col gap-4">
									<h2 className="text-balance font-bold text-5xl leading-tight">
										MORE FROM THE GALLERY
									</h2>
									<p className="max-w-[28ch] text-pretty text-muted-foreground">
										More training clips, match-day stills, and academy moments.
									</p>
								</div>
							</div>
						</header>
						{more.map((item) => (
							<GalleryMasonryItem key={item.id} item={item} />
						))}
					</div>
				</div>
			</section>
			</MediaGalleryBoundary>
		</GalleryPlaybackBoundary>
	);
};
