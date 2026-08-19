import type React from "react";
import { cn } from "#/lib/utils";

const ASPECT_CLASS = {
	landscape: "aspect-[4/3]",
	portrait: "aspect-[3/4]",
	square: "aspect-square",
	wide: "aspect-video",
} as const;

type GalleryAspect = keyof typeof ASPECT_CLASS;

type GalleryImage = {
	id: string;
	src: string;
	alt: string;
	aspect?: GalleryAspect;
};

export const LifeAtHFS: React.FC = () => {
	return (
		<section className="mx-auto flex flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16">
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
									SEE US IN ACTION
								</h2>
								<p className="max-w-[28ch] text-pretty text-muted-foreground">
									A glimpse into our training sessions, matches, and academy
									moments.
								</p>
							</div>
						</div>
					</header>
					{GALLERY_IMAGES.map((image) => (
						<GalleryItem key={image.id} image={image} />
					))}
				</div>
			</div>
		</section>
	);
};

const GalleryItem: React.FC<{ image: GalleryImage }> = ({ image }) => {
	return (
		<figure className="mb-6 break-inside-avoid">
			<img
				src={image.src}
				alt={image.alt}
				className={cn(
					"w-full rounded-2xl object-cover outline outline-black/10 dark:outline-white/10",
					ASPECT_CLASS[image.aspect ?? "landscape"],
				)}
			/>
		</figure>
	);
};

const GALLERY_IMAGES: GalleryImage[] = [
	{
		id: "training-dribble",
		src: "https://placehold.co/800x600/1a1a1a/white?text=Training",
		alt: "Player dribbling during a training session",
		aspect: "landscape",
	},
	{
		id: "soccer-ball",
		src: "https://placehold.co/600x900/1a1a1a/white?text=Ball",
		alt: "Soccer ball on a pitch line",
		aspect: "portrait",
	},
	{
		id: "shot",
		src: "https://placehold.co/800x560/1a1a1a/white?text=Shot",
		alt: "Player striking the ball on the pitch",
		aspect: "wide",
	},
	{
		id: "goal",
		src: "https://placehold.co/800x700/1a1a1a/white?text=Goal",
		alt: "Close-up of a soccer goal on a green pitch",
		aspect: "square",
	},
	{
		id: "practice",
		src: "https://placehold.co/800x600/1a1a1a/white?text=Practice",
		alt: "Athlete resting on the pitch after practice",
		aspect: "landscape",
	},
	{
		id: "ready-position",
		src: "https://placehold.co/600x900/1a1a1a/white?text=Match",
		alt: "Player in a ready position on the pitch",
		aspect: "portrait",
	},
];
