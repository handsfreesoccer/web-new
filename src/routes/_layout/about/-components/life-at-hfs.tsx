import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import type React from "react";
import { GalleryMasonryItem } from "#/components/gallery/gallery-masonry-item";
import { GalleryPlaybackBoundary } from "#/components/gallery/gallery-playback";
import { MediaGalleryBoundary } from "#/components/gallery/media-gallery-lightbox";
import { Button } from "#/components/ui/button";
import { useGalleryMedia } from "#/hooks/use-media";
import { GALLERY_MORE_SECTION_ID } from "#/lib/constants";
import { resolveGalleryItems, splitGalleryItems } from "#/lib/gallery-utils";

export const LifeAtHFS: React.FC = () => {
	const { data: galleryItems } = useGalleryMedia();
	const { featured } = splitGalleryItems(resolveGalleryItems(galleryItems));

	return (
		<GalleryPlaybackBoundary items={featured}>
			<MediaGalleryBoundary items={featured}>
				<section className="mx-auto flex flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16">
					<div className="flex w-full max-w-360 flex-col gap-8">
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
											SEE US IN ACTION
										</h2>
										<p className="max-w-[28ch] text-pretty text-muted-foreground">
											A glimpse into our training sessions, matches, and academy
											moments.
										</p>
									</div>
								</div>
							</header>
							{featured.map((item) => (
								<GalleryMasonryItem key={item.id} item={item} />
							))}
						</div>
						<Button
							nativeButton={false}
							render={<Link hash={GALLERY_MORE_SECTION_ID} to="/about" />}
							className="h-auto w-fit gap-2 self-end rounded-full p-1 pl-4"
						>
							<p>View more</p>
							<span className="grid size-11 place-content-center rounded-full bg-white">
								<ArrowRightIcon className="size-4 text-primary" />
							</span>
						</Button>
					</div>
				</section>
			</MediaGalleryBoundary>
		</GalleryPlaybackBoundary>
	);
};
