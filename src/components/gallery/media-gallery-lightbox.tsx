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
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useOptionalGalleryPlayback } from "#/components/gallery/gallery-playback";
import { Button } from "#/components/ui/button";
import type { GalleryMedia } from "#/lib/gallery";
import { cn } from "#/lib/utils";

const easeOut = [0.2, 0, 0, 1] as const;

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
	const filmstripItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const playback = useOptionalGalleryPlayback();
	const lenis = useLenis();
	const isOpen = activeIndex !== null;
	const activeItem =
		activeIndex !== null ? (items[activeIndex] ?? null) : null;

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const openAt = useCallback(
		(id: string) => {
			const index = items.findIndex((item) => item.id === id);
			if (index < 0) {
				return;
			}
			playback?.suspend();
			setActiveIndex(index);
		},
		[items, playback],
	);

	const closeGallery = useCallback(() => {
		const current = activeIndex !== null ? items[activeIndex] : null;
		setActiveIndex(null);
		playback?.resume(current?.kind === "video" ? current.id : undefined);
	}, [activeIndex, items, playback]);

	const showPrevious = useCallback(() => {
		setActiveIndex((currentIndex) => {
			if (currentIndex === null || items.length === 0) {
				return currentIndex;
			}
			return (currentIndex - 1 + items.length) % items.length;
		});
	}, [items.length]);

	const showNext = useCallback(() => {
		setActiveIndex((currentIndex) => {
			if (currentIndex === null || items.length === 0) {
				return currentIndex;
			}
			return (currentIndex + 1) % items.length;
		});
	}, [items.length]);

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
						className="fixed inset-0 z-100"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.22, ease: easeOut }}
					>
						<button
							type="button"
							aria-label="Close gallery"
							className="absolute inset-0 z-0 bg-black/80"
							onClick={closeGallery}
						/>

						<div
							className="pointer-events-none fixed z-10 flex min-h-0 items-center justify-center px-4 py-8 sm:px-16 sm:py-20"
							style={{ inset: 0, bottom: items.length > 1 ? 96 : 32 }}
						>
							<LightboxMedia item={activeItem} />
						</div>

						<div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between gap-4 px-5 pt-5">
							<div className="flex items-center justify-between">
								<p className="pointer-events-auto font-semibold text-white tabular-nums">
									{activeIndex + 1}/{items.length}
								</p>
								<Button
									type="button"
									size="icon-lg"
									className="pointer-events-auto size-11 rounded-full bg-primary text-white transition-transform duration-200 ease-out hover:bg-primary/90 active:scale-[0.96]"
									aria-label="Close gallery"
									onClick={closeGallery}
								>
									<XIcon className="size-5" />
								</Button>
							</div>

							{items.length > 1 ? (
								<div className="pointer-events-none flex flex-1 items-center justify-between">
									<Button
										type="button"
										size="icon-lg"
										className="pointer-events-auto size-11 rounded-full bg-primary text-white transition-transform duration-200 ease-out hover:bg-primary/90 active:scale-[0.96]"
										aria-label="Show previous"
										onClick={showPrevious}
									>
										<ChevronLeftIcon className="size-5" />
									</Button>
									<Button
										type="button"
										size="icon-lg"
										className="pointer-events-auto size-11 rounded-full bg-primary text-white transition-transform duration-200 ease-out hover:bg-primary/90 active:scale-[0.96]"
										aria-label="Show next"
										onClick={showNext}
									>
										<ChevronRightIcon className="size-5" />
									</Button>
								</div>
							) : (
								<div className="flex-1" />
							)}

							{items.length > 1 ? (
								<div className="pointer-events-auto w-full border-white/10 border-t bg-black/25 pt-2 pb-2 backdrop-blur-sm">
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
														onClick={() => setActiveIndex(index)}
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
								</div>
							) : null}
						</div>
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

function LightboxMedia({ item }: { item: GalleryMedia }) {
	return (
		<motion.div
			key={item.id}
			initial={{ opacity: 0, scale: 0.96 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, y: 8 }}
			transition={{ duration: 0.28, ease: easeOut }}
			className="pointer-events-auto max-h-full max-w-full"
			onClick={(event) => event.stopPropagation()}
		>
			{item.kind === "video" ? (
				<video
					key={item.src}
					src={item.src}
					poster={item.poster}
					muted
					autoPlay
					playsInline
					controls
					preload="auto"
					aria-label={item.alt}
					className="max-h-full max-w-full rounded-3xl object-contain outline outline-white/10"
				/>
			) : (
				<img
					src={item.src}
					alt={item.alt}
					className="max-h-full max-w-full rounded-3xl object-contain outline outline-white/10"
				/>
			)}
		</motion.div>
	);
}
