import { useLenis } from "lenis/react";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	Maximize2Icon,
	PlayIcon,
	XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useOptionalGalleryPlayback } from "#/components/gallery/gallery-playback";
import { Button } from "#/components/ui/button";
import type { GalleryMedia } from "#/lib/gallery";
import { cn } from "#/lib/utils";

const easeOut = [0.2, 0, 0, 1] as const;
const CHROME_HIDE_DELAY_MS = 2000;

const chromeTransition = {
	opacity: { duration: 0.22, ease: easeOut },
} as const;

type MediaGalleryContextValue = {
	items: GalleryMedia[];
	isOpen: boolean;
	openAt: (id: string) => void;
};

const MediaGalleryContext = createContext<MediaGalleryContextValue | null>(
	null,
);

export function useMediaGallery() {
	const context = useContext(MediaGalleryContext);
	if (!context) {
		throw new Error("useMediaGallery must be used within MediaGalleryProvider");
	}
	return context;
}

export function MediaGalleryProvider({
	items,
	children,
	dialogLabel = "Gallery preview",
}: {
	items: GalleryMedia[];
	children: ReactNode;
	dialogLabel?: string;
}) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [chromeVisible, setChromeVisible] = useState(true);
	const filmstripItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const chromeHideTimerRef = useRef<number | null>(null);
	const isVideoPlayingRef = useRef(false);
	const playback = useOptionalGalleryPlayback();
	const lenis = useLenis();
	const isOpen = activeIndex !== null;
	const activeItem =
		activeIndex !== null ? (items[activeIndex] ?? null) : null;

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const clearChromeHideTimer = useCallback(() => {
		if (chromeHideTimerRef.current !== null) {
			window.clearTimeout(chromeHideTimerRef.current);
			chromeHideTimerRef.current = null;
		}
	}, []);

	const scheduleChromeHide = useCallback(() => {
		clearChromeHideTimer();
		chromeHideTimerRef.current = window.setTimeout(() => {
			setChromeVisible(false);
		}, CHROME_HIDE_DELAY_MS);
	}, [clearChromeHideTimer]);

	const showChrome = useCallback(
		(rehideWhilePlaying = false) => {
			setChromeVisible(true);
			clearChromeHideTimer();
			if (rehideWhilePlaying) scheduleChromeHide();
		},
		[clearChromeHideTimer, scheduleChromeHide],
	);

	const handleVideoPlaying = useCallback(() => {
		isVideoPlayingRef.current = true;
		scheduleChromeHide();
	}, [scheduleChromeHide]);

	const handleVideoPause = useCallback(() => {
		isVideoPlayingRef.current = false;
		clearChromeHideTimer();
	}, [clearChromeHideTimer]);

	const openAt = useCallback(
		(id: string) => {
			const index = items.findIndex((item) => item.id === id);
			if (index < 0) {
				return;
			}
			clearChromeHideTimer();
			isVideoPlayingRef.current = false;
			setChromeVisible(true);
			playback?.suspend();
			setActiveIndex(index);
		},
		[clearChromeHideTimer, items, playback],
	);

	const closeGallery = useCallback(() => {
		const current = activeIndex !== null ? items[activeIndex] : null;
		clearChromeHideTimer();
		isVideoPlayingRef.current = false;
		setChromeVisible(true);
		setActiveIndex(null);
		playback?.resume(current?.kind === "video" ? current.id : undefined);
	}, [activeIndex, clearChromeHideTimer, items, playback]);

	const showPrevious = useCallback(() => {
		clearChromeHideTimer();
		isVideoPlayingRef.current = false;
		setChromeVisible(true);
		setActiveIndex((currentIndex) => {
			if (currentIndex === null || items.length === 0) {
				return currentIndex;
			}
			return (currentIndex - 1 + items.length) % items.length;
		});
	}, [clearChromeHideTimer, items.length]);

	const showNext = useCallback(() => {
		clearChromeHideTimer();
		isVideoPlayingRef.current = false;
		setChromeVisible(true);
		setActiveIndex((currentIndex) => {
			if (currentIndex === null || items.length === 0) {
				return currentIndex;
			}
			return (currentIndex + 1) % items.length;
		});
	}, [clearChromeHideTimer, items.length]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		lenis?.stop();
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			lenis?.start();
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen, lenis]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeGallery();
			}
			if (event.key === "ArrowLeft") {
				showPrevious();
			}
			if (event.key === "ArrowRight") {
				showNext();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [closeGallery, isOpen, showNext, showPrevious]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleMouseMove = () => {
			setChromeVisible(true);
			if (isVideoPlayingRef.current) {
				scheduleChromeHide();
			} else {
				clearChromeHideTimer();
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [clearChromeHideTimer, isOpen, scheduleChromeHide]);

	useEffect(() => {
		return () => {
			clearChromeHideTimer();
		};
	}, [clearChromeHideTimer]);

	useEffect(() => {
		if (activeIndex === null || items.length <= 1) {
			return;
		}
		filmstripItemRefs.current[activeIndex]?.scrollIntoView({
			inline: "center",
			block: "nearest",
			behavior: "smooth",
		});
	}, [activeIndex, items.length]);

	const contextValue = useMemo<MediaGalleryContextValue>(
		() => ({
			items,
			isOpen,
			openAt,
		}),
		[isOpen, items, openAt],
	);

	const galleryModal =
		isMounted &&
		createPortal(
			<AnimatePresence>
				{isOpen && activeItem && activeIndex !== null ? (
					<motion.div
						key="gallery-lightbox"
						role="dialog"
						aria-modal="true"
						aria-label={dialogLabel}
						className="fixed inset-0 z-100 flex flex-col gap-4 bg-black/80 p-5 sm:gap-5"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.22, ease: easeOut }}
					>
						<button
							type="button"
							aria-label="Close gallery"
							className="absolute inset-0 -z-10"
							onClick={closeGallery}
						/>

						<motion.div
							className={cn(
								"relative z-10 flex shrink-0 items-center justify-between",
								!chromeVisible && "pointer-events-none",
							)}
							initial={false}
							animate={{ opacity: chromeVisible ? 1 : 0 }}
							transition={chromeTransition}
							aria-hidden={!chromeVisible}
						>
							<p className="font-semibold text-white tabular-nums">
								{activeIndex + 1}/{items.length}
							</p>
							<Button
								type="button"
								size="icon-lg"
								className="size-11 rounded-full bg-primary text-white transition-transform duration-200 ease-out hover:bg-primary/90 active:scale-[0.96]"
								aria-label="Close gallery"
								onClick={closeGallery}
								tabIndex={chromeVisible ? 0 : -1}
							>
								<XIcon className="size-5" />
							</Button>
						</motion.div>

						<div className="relative z-10 flex min-h-0 flex-1 items-center gap-3 sm:gap-4">
							{items.length > 1 ? (
								<motion.div
									className={cn(!chromeVisible && "pointer-events-none")}
									initial={false}
									animate={{ opacity: chromeVisible ? 1 : 0 }}
									transition={chromeTransition}
									aria-hidden={!chromeVisible}
								>
									<Button
										type="button"
										size="icon-lg"
										className="size-11 shrink-0 rounded-full bg-primary text-white transition-transform duration-200 ease-out hover:bg-primary/90 active:scale-[0.96]"
										aria-label="Show previous"
										onClick={showPrevious}
										tabIndex={chromeVisible ? 0 : -1}
									>
										<ChevronLeftIcon className="size-5" />
									</Button>
								</motion.div>
							) : null}

							<div className="flex min-h-0 flex-1 items-center justify-center">
								<LightboxMedia
									item={activeItem}
									onMediaClick={showChrome}
									onVideoPlaying={handleVideoPlaying}
									onVideoPause={handleVideoPause}
								/>
							</div>

							{items.length > 1 ? (
								<motion.div
									className={cn(!chromeVisible && "pointer-events-none")}
									initial={false}
									animate={{ opacity: chromeVisible ? 1 : 0 }}
									transition={chromeTransition}
									aria-hidden={!chromeVisible}
								>
									<Button
										type="button"
										size="icon-lg"
										className="size-11 shrink-0 rounded-full bg-primary text-white transition-transform duration-200 ease-out hover:bg-primary/90 active:scale-[0.96]"
										aria-label="Show next"
										onClick={showNext}
										tabIndex={chromeVisible ? 0 : -1}
									>
										<ChevronRightIcon className="size-5" />
									</Button>
								</motion.div>
							) : null}
						</div>

						{items.length > 1 ? (
							<motion.div
								className={cn(
									"relative z-10 shrink-0 border-white/10 border-t bg-black/25 pt-2 pb-2 backdrop-blur-sm",
									!chromeVisible && "pointer-events-none",
								)}
								initial={false}
								animate={{ opacity: chromeVisible ? 1 : 0 }}
								transition={chromeTransition}
								aria-hidden={!chromeVisible}
							>
								<div className="scrollbar-none w-full overflow-x-auto">
									<ul
										aria-label="Gallery thumbnails"
										className="mx-auto flex w-max min-w-full items-center justify-center gap-2 px-1"
									>
										{items.map((item, index) => (
											<li key={item.id} className="shrink-0">
												<button
													type="button"
													ref={(element) => {
														filmstripItemRefs.current[index] = element;
													}}
													onClick={() => {
														clearChromeHideTimer();
														isVideoPlayingRef.current = false;
														setChromeVisible(true);
														setActiveIndex(index);
													}}
													className={cn(
														"relative block cursor-pointer overflow-hidden rounded-md outline outline-white/10 transition-opacity duration-200 ease-out focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60",
														index === activeIndex
															? "opacity-100"
															: "opacity-55 hover:opacity-100",
													)}
													aria-label={`View ${item.alt}`}
													aria-current={
														index === activeIndex ? "true" : undefined
													}
													tabIndex={chromeVisible ? 0 : -1}
												>
													{item.kind === "video" ? (
														<>
															<video
																src={item.src}
																poster={item.poster}
																muted
																playsInline
																preload="metadata"
																aria-hidden
																className="h-12 w-16 object-cover sm:h-14 sm:w-18"
															/>
															<span className="absolute inset-0 grid place-content-center bg-black/25">
																<PlayIcon className="size-3 translate-x-px text-white" />
															</span>
														</>
													) : (
														<img
															src={item.src}
															alt=""
															aria-hidden
															className="h-12 w-16 object-cover sm:h-14 sm:w-18"
														/>
													)}
												</button>
											</li>
										))}
									</ul>
								</div>
							</motion.div>
						) : null}
					</motion.div>
				) : null}
			</AnimatePresence>,
			document.body,
		);

	return (
		<MediaGalleryContext.Provider value={contextValue}>
			{children}
			{galleryModal}
		</MediaGalleryContext.Provider>
	);
}

export function MediaGalleryBoundary({
	items,
	children,
}: {
	items: GalleryMedia[];
	children: ReactNode;
}) {
	const existing = useContext(MediaGalleryContext);
	if (existing) {
		return children;
	}

	return (
		<MediaGalleryProvider items={items}>{children}</MediaGalleryProvider>
	);
}

export function ViewInFullscreenButton({
	itemId,
	className,
}: {
	itemId: string;
	className?: string;
}) {
	const { openAt } = useMediaGallery();

	return (
		<Button
			type="button"
			size="icon-lg"
			aria-label="View in full screen"
			onClick={(event) => {
				event.stopPropagation();
				openAt(itemId);
			}}
			className={cn(
				"size-11 rounded-full bg-white text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform duration-200 ease-out hover:bg-white active:scale-[0.96]",
				className,
			)}
		>
			<Maximize2Icon className="size-4" />
		</Button>
	);
}

function LightboxMedia({
	item,
	onMediaClick,
	onVideoPlaying,
	onVideoPause,
}: {
	item: GalleryMedia;
	onMediaClick: (rehideWhilePlaying: boolean) => void;
	onVideoPlaying: () => void;
	onVideoPause: () => void;
}) {
	const videoRef = useRef<HTMLVideoElement>(null);

	const handleMediaClick = (event: MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		const isPlaying =
			item.kind === "video" &&
			videoRef.current !== null &&
			!videoRef.current.paused;
		onMediaClick(isPlaying);
	};

	const handleMediaKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		const isPlaying =
			item.kind === "video" &&
			videoRef.current !== null &&
			!videoRef.current.paused;
		onMediaClick(isPlaying);
	};

	return (
		<motion.div
			key={item.id}
			initial={{ opacity: 0, scale: 0.96 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, y: 8 }}
			transition={{ duration: 0.28, ease: easeOut }}
			className="flex h-full min-h-0 w-full cursor-pointer items-center justify-center"
			role="button"
			tabIndex={0}
			aria-label={`Show gallery controls for ${item.alt}`}
			onClick={handleMediaClick}
			onKeyDown={handleMediaKeyDown}
		>
			{item.kind === "video" ? (
				<video
					ref={videoRef}
					key={item.src}
					src={item.src}
					poster={item.poster}
					muted
					autoPlay
					playsInline
					controls
					preload="auto"
					aria-label={item.alt}
					onPlaying={onVideoPlaying}
					onPause={onVideoPause}
					className="max-h-full max-w-full rounded-2xl object-contain ring-1 ring-white/10"
				/>
			) : (
				<img
					src={item.src}
					alt={item.alt}
					className="max-h-full max-w-full rounded-2xl object-contain ring-1 ring-white/10"
				/>
			)}
		</motion.div>
	);
}
