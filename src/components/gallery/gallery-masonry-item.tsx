import { PauseIcon, PlayIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { GalleryMasonrySkeleton } from "#/components/gallery/gallery-masonry-skeleton";
import { useGalleryPlayback } from "#/components/gallery/gallery-playback";
import {
	useMediaGallery,
	ViewInFullscreenButton,
} from "#/components/gallery/media-gallery-lightbox";
import { useLazyInView } from "#/hooks/use-lazy-in-view";
import { ASPECT_CLASS, type GalleryMedia } from "#/lib/gallery";
import { cn } from "#/lib/utils";

const mediaClassName =
	"w-full rounded-2xl object-cover outline outline-black/10 dark:outline-white/10";

const fullscreenButtonWrapClassName =
	"absolute top-3 right-3 z-20 opacity-0 transition-opacity duration-200 ease-out pointer-events-none group-hover/media:pointer-events-auto group-hover/media:opacity-100 group-focus-within/media:pointer-events-auto group-focus-within/media:opacity-100";

export function GalleryMasonryItem({ item }: { item: GalleryMedia }) {
	const aspect = item.aspect ?? "landscape";
	const aspectClass = ASPECT_CLASS[aspect];
	const { ref, isInView } = useLazyInView();

	return (
		<div ref={ref} className="mb-6 break-inside-avoid">
			{isInView ? (
				item.kind === "image" ? (
					<GalleryImageItem item={item} aspectClass={aspectClass} />
				) : (
					<GalleryVideoItem item={item} aspectClass={aspectClass} />
				)
			) : (
				<GalleryMasonrySkeleton aspect={aspect} className="mb-0" />
			)}
		</div>
	);
}

function GalleryImageItem({
	item,
	aspectClass,
}: {
	item: GalleryMedia;
	aspectClass: string;
}) {
	const { openAt } = useMediaGallery();

	return (
		<figure className="group/media relative">
			<button
				type="button"
				onClick={() => openAt(item.id)}
				aria-label={`View ${item.alt} in full screen`}
				className="block w-full cursor-pointer"
			>
				<img
					src={item.src}
					alt={item.alt}
					loading="lazy"
					decoding="async"
					className={cn(mediaClassName, aspectClass)}
				/>
				<span className="pointer-events-none absolute inset-0 rounded-2xl bg-black/20 opacity-0 transition-opacity duration-200 ease-out group-hover/media:opacity-100" />
			</button>
			<div className={fullscreenButtonWrapClassName}>
				<ViewInFullscreenButton itemId={item.id} />
			</div>
		</figure>
	);
}

function GalleryVideoItem({
	item,
	aspectClass,
}: {
	item: GalleryMedia;
	aspectClass: string;
}) {
	const { playingId, registerVideo, play, pause, onEnded } =
		useGalleryPlayback();
	const [isHovered, setIsHovered] = useState(false);
	const isPlaying = playingId === item.id;

	const setVideoRef = useCallback(
		(element: HTMLVideoElement | null) => {
			registerVideo(item.id, element);
		},
		[item.id, registerVideo],
	);

	return (
		<figure
			className="group/media relative"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<video
				ref={setVideoRef}
				src={item.src}
				poster={item.poster}
				muted
				playsInline
				preload="metadata"
				disablePictureInPicture
				aria-label={item.alt}
				className={cn(mediaClassName, aspectClass)}
				onEnded={() => onEnded(item.id)}
			/>
			<div
				className={cn(
					"pointer-events-none absolute inset-0 z-10 grid place-content-center rounded-2xl bg-black/25 opacity-0 transition-opacity duration-200 ease-out",
					isHovered && "opacity-100",
					"group-focus-within/media:opacity-100",
				)}
			>
				<button
					type="button"
					aria-label={isPlaying ? "Pause video" : "Play video"}
					onClick={() => {
						if (isPlaying) {
							pause(item.id);
							return;
						}
						play(item.id);
					}}
					className={cn(
						"grid size-11 min-h-11 min-w-11 place-content-center rounded-full bg-white text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform duration-200 ease-out focus-visible:pointer-events-auto active:scale-[0.96]",
						isHovered && "pointer-events-auto",
					)}
				>
					{isPlaying ? (
						<PauseIcon className="size-4" />
					) : (
						<PlayIcon className="size-4 translate-x-px" />
					)}
				</button>
			</div>
			<div className={fullscreenButtonWrapClassName}>
				<ViewInFullscreenButton itemId={item.id} />
			</div>
		</figure>
	);
}
