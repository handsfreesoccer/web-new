import { createFileRoute } from "@tanstack/react-router";
import { GalleryPlaybackProvider } from "#/components/gallery/gallery-playback";
import { MediaGalleryProvider } from "#/components/gallery/media-gallery-lightbox";
import { useGalleryMedia } from "#/hooks/use-media";
import { resolveGalleryItems, splitGalleryItems } from "#/lib/gallery-utils";
import { pageMeta, pageTitle } from "#/lib/site-meta";
import { Classes } from "./-components/classes";
import { CoreValues } from "./-components/core-values";
import { HeadCoach } from "./-components/head-coach";
import { HeroSection } from "./-components/hero-section";
import { LifeAtHFS } from "./-components/life-at-hfs";
import { MoreFromTheGallery } from "./-components/more-from-the-gallery";
import { Story } from "./-components/story";
import { TakeTheFirstSteps } from "./-components/take-the-first-steps";

export const Route = createFileRoute("/_layout/about")({
	head: () => ({
		meta: pageMeta({
			title: pageTitle("About Us"),
			description:
				"Meet Coach Omeiza and HandsFree Soccer Academy — 1:1 and small group training for kids ages 6–18 in North Texas.",
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { data: galleryItems } = useGalleryMedia();
	const { all } = splitGalleryItems(resolveGalleryItems(galleryItems));

	return (
		<GalleryPlaybackProvider items={all}>
			<MediaGalleryProvider items={all}>
				<div className="flex-1">
					<HeroSection />
					<HeadCoach />
					<Story />
					<CoreValues />
					<LifeAtHFS />
					<Classes />
					<MoreFromTheGallery />
					<TakeTheFirstSteps />
				</div>
			</MediaGalleryProvider>
		</GalleryPlaybackProvider>
	);
}
