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

/** Fallback gallery used when R2 is not configured or the bucket is empty. */
const SAMPLE_VIDEOS = {
	training: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
	match: "https://www.w3schools.com/html/mov_bbb.mp4",
	dribble: "https://www.w3schools.com/html/movie.mp4",
	pass: "https://filesamples.com/samples/video/mp4/sample_640x360.mp4",
	goal: "https://filesamples.com/samples/video/mp4/sample_960x540.mp4",
	warmup:
		"https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm",
} as const;

export const GALLERY_ITEMS: GalleryMedia[] = [
	{
		id: "training-clip",
		kind: "video",
		src: SAMPLE_VIDEOS.training,
		alt: "Players training on the pitch",
		aspect: "landscape",
	},
	{
		id: "soccer-ball",
		kind: "image",
		src: "https://placehold.co/600x900/1a1a1a/white?text=Ball",
		alt: "Soccer ball on a pitch line",
		aspect: "portrait",
	},
	{
		id: "match-clip",
		kind: "video",
		src: SAMPLE_VIDEOS.match,
		alt: "Match play during an academy session",
		aspect: "wide",
	},
	{
		id: "goal-still",
		kind: "image",
		src: "https://placehold.co/800x700/1a1a1a/white?text=Goal",
		alt: "Close-up of a soccer goal on a green pitch",
		aspect: "square",
	},
	{
		id: "dribble-clip",
		kind: "video",
		src: SAMPLE_VIDEOS.dribble,
		alt: "Player dribbling through cones",
		aspect: "landscape",
	},
	{
		id: "ready-position",
		kind: "image",
		src: "https://placehold.co/600x900/1a1a1a/white?text=Match",
		alt: "Player in a ready position on the pitch",
		aspect: "portrait",
	},
	{
		id: "passing-clip",
		kind: "video",
		src: SAMPLE_VIDEOS.pass,
		alt: "Passing drill during small-group training",
		aspect: "wide",
	},
	{
		id: "practice-still",
		kind: "image",
		src: "https://placehold.co/800x600/1a1a1a/white?text=Practice",
		alt: "Athlete resting on the pitch after practice",
		aspect: "landscape",
	},
	{
		id: "goal-clip",
		kind: "video",
		src: SAMPLE_VIDEOS.goal,
		alt: "Celebration after a goal",
		aspect: "square",
	},
	{
		id: "shot-still",
		kind: "image",
		src: "https://placehold.co/800x560/1a1a1a/white?text=Shot",
		alt: "Player striking the ball on the pitch",
		aspect: "wide",
	},
	{
		id: "warmup-clip",
		kind: "video",
		src: SAMPLE_VIDEOS.warmup,
		alt: "Warm-up before a session",
		aspect: "landscape",
	},
	{
		id: "team-still",
		kind: "image",
		src: "https://placehold.co/600x800/1a1a1a/white?text=Team",
		alt: "Academy players together on the sideline",
		aspect: "portrait",
	},
];

export const FEATURED_GALLERY_COUNT = 6;

export const GALLERY_FEATURED = GALLERY_ITEMS.slice(0, FEATURED_GALLERY_COUNT);
export const GALLERY_MORE = GALLERY_ITEMS.slice(FEATURED_GALLERY_COUNT);
