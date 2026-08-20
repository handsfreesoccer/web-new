import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import type { GalleryMedia } from "#/lib/gallery";

type GalleryPlaybackContextValue = {
	playingId: string | null;
	registerVideo: (id: string, element: HTMLVideoElement | null) => void;
	play: (id: string) => void;
	pause: (id: string) => void;
	onEnded: (id: string) => void;
	suspend: () => void;
	resume: (id?: string) => void;
};

const GalleryPlaybackContext =
	createContext<GalleryPlaybackContextValue | null>(null);

function videoIdsFrom(items: GalleryMedia[]) {
	return items.filter((item) => item.kind === "video").map((item) => item.id);
}

export function GalleryPlaybackProvider({
	items,
	children,
}: {
	items: GalleryMedia[];
	children: ReactNode;
}) {
	const videosRef = useRef(new Map<string, HTMLVideoElement>());
	const startedRef = useRef(false);
	const playingIdRef = useRef<string | null>(null);
	const suspendedRef = useRef(false);
	const [playingId, setPlayingId] = useState<string | null>(null);
	playingIdRef.current = playingId;
	const videoOrder = useMemo(() => videoIdsFrom(items), [items]);

	const pauseAllExcept = useCallback((keepId?: string) => {
		for (const [id, element] of videosRef.current) {
			if (id === keepId) {
				continue;
			}
			element.pause();
		}
	}, []);

	const play = useCallback(
		(id: string) => {
			if (suspendedRef.current) {
				return;
			}

			const element = videosRef.current.get(id);
			if (!element) {
				return;
			}

			pauseAllExcept(id);
			element.muted = true;
			element.playsInline = true;
			setPlayingId(id);
			void element.play().catch(() => {
				setPlayingId((current) => (current === id ? null : current));
			});
		},
		[pauseAllExcept],
	);

	const pause = useCallback((id: string) => {
		videosRef.current.get(id)?.pause();
		setPlayingId((current) => (current === id ? null : current));
	}, []);

	const suspend = useCallback(() => {
		suspendedRef.current = true;
		pauseAllExcept();
		setPlayingId(null);
	}, [pauseAllExcept]);

	const resume = useCallback(
		(id?: string) => {
			suspendedRef.current = false;
			const nextId = id ?? videoOrder.find((videoId) => videosRef.current.has(videoId));
			if (nextId) {
				play(nextId);
			}
		},
		[play, videoOrder],
	);

	const onEnded = useCallback(
		(id: string) => {
			if (suspendedRef.current || playingIdRef.current !== id) {
				return;
			}

			const currentIndex = videoOrder.indexOf(id);
			if (currentIndex < 0 || videoOrder.length === 0) {
				setPlayingId((current) => (current === id ? null : current));
				return;
			}

			for (let offset = 1; offset <= videoOrder.length; offset += 1) {
				const nextId = videoOrder[(currentIndex + offset) % videoOrder.length];
				if (nextId && videosRef.current.has(nextId)) {
					play(nextId);
					return;
				}
			}

			setPlayingId((current) => (current === id ? null : current));
		},
		[play, videoOrder],
	);

	const registerVideo = useCallback(
		(id: string, element: HTMLVideoElement | null) => {
			if (element) {
				element.muted = true;
				element.defaultMuted = true;
				element.playsInline = true;
				videosRef.current.set(id, element);

				if (!startedRef.current && videoOrder[0] === id) {
					startedRef.current = true;
					play(id);
				}
				return;
			}

			videosRef.current.delete(id);
			if (videosRef.current.size === 0) {
				startedRef.current = false;
			}
			setPlayingId((current) => (current === id ? null : current));
		},
		[play, videoOrder],
	);

	useEffect(() => {
		return () => {
			pauseAllExcept();
			videosRef.current.clear();
		};
	}, [pauseAllExcept]);

	const value = useMemo<GalleryPlaybackContextValue>(
		() => ({
			playingId,
			registerVideo,
			play,
			pause,
			onEnded,
			suspend,
			resume,
		}),
		[onEnded, pause, play, playingId, registerVideo, resume, suspend],
	);

	return (
		<GalleryPlaybackContext.Provider value={value}>
			{children}
		</GalleryPlaybackContext.Provider>
	);
}

export function GalleryPlaybackBoundary({
	items,
	children,
}: {
	items: GalleryMedia[];
	children: ReactNode;
}) {
	const existing = useContext(GalleryPlaybackContext);
	if (existing) {
		return children;
	}

	return (
		<GalleryPlaybackProvider items={items}>{children}</GalleryPlaybackProvider>
	);
}

export function useOptionalGalleryPlayback() {
	return useContext(GalleryPlaybackContext);
}

export function useGalleryPlayback() {
	const context = useOptionalGalleryPlayback();
	if (!context) {
		throw new Error(
			"useGalleryPlayback must be used within GalleryPlaybackProvider",
		);
	}
	return context;
}
