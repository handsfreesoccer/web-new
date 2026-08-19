"use client";

import { animate } from "animejs";
import { ArrowLeftIcon, ArrowRightIcon, StarIcon } from "lucide-react";
import type React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { QuoteIcon } from "#/components/icons/quote-icon";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

export const Testimonial: React.FC = () => {
	return (
		<section className="mx-auto flex flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="flex w-full max-w-360 flex-col justify-between gap-10">
				<div className="flex flex-1 flex-col items-start gap-6">
					<div className="flex items-center gap-2">
						<span className="relative flex size-2">
							<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
							<span className="relative size-2 rounded-full bg-primary" />
						</span>
						<p className="font-medium text-base">Value</p>
					</div>
					<div className="flex w-full flex-1 flex-wrap justify-between gap-2 sm:gap-6">
						<h2 className="text-balance font-bold text-5xl leading-tight">
							WHAT PLAYERS SAY
						</h2>

						<p className="max-w-[35ch] text-pretty text-muted-foreground">
							See how HandsFreeSoccer helps players build skills and confidence.
						</p>
					</div>
					<TestimonialCarousel testimonials={TESTIMONIALS} />
				</div>
			</div>
		</section>
	);
};

const TestimonialCarousel: React.FC<{
	testimonials: typeof TESTIMONIALS;
}> = ({ testimonials }) => {
	const { canGoNext, canGoPrev, goNext, goPrev, listRef, viewportRef } =
		useTestimonialCarousel();

	return (
		<div className="flex w-full flex-col gap-6">
			<div ref={viewportRef} className="@container w-full">
				<ul
					ref={listRef}
					className="flex transform-gpu flex-nowrap items-stretch gap-4 will-change-transform"
				>
					{testimonials.map((testimonial) => (
						<TestimonialCard key={testimonial.id} testimonial={testimonial} />
					))}
				</ul>
			</div>
			<div className="flex items-center justify-end gap-2">
				<Button
					aria-label="Show previous testimonials"
					className="size-14 cursor-pointer rounded-full p-0 active:scale-[0.96]"
					type="button"
					variant={canGoPrev ? "default" : "outline"}
					onClick={goPrev}
				>
					<ArrowLeftIcon className="size-5" />
				</Button>
				<Button
					aria-label="Show next testimonials"
					className="size-14 cursor-pointer rounded-full p-0 active:scale-[0.96]"
					type="button"
					variant={canGoNext ? "default" : "outline"}
					onClick={goNext}
				>
					<ArrowRightIcon className="size-5" />
				</Button>
			</div>
		</div>
	);
};

const CAROUSEL_EASE = "outCubic";
const CAROUSEL_DURATION = 520;
const OFFSET_EPSILON = 1;

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useTestimonialCarousel() {
	const viewportRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const offsetRef = useRef(0);
	const animationRef = useRef<ReturnType<typeof animate> | null>(null);
	const [canGoPrev, setCanGoPrev] = useState(false);
	const [canGoNext, setCanGoNext] = useState(false);

	const getMetrics = useCallback(() => {
		const viewport = viewportRef.current;
		const list = listRef.current;
		const items = list ? (Array.from(list.children) as HTMLElement[]) : [];
		const firstItem = items[0];

		if (!viewport || !list || !firstItem) {
			return null;
		}

		const itemWidth = firstItem.offsetWidth;
		const gap = Math.round(
			Number.parseFloat(getComputedStyle(list).columnGap) || 0,
		);
		const step = itemWidth + gap;
		const contentWidth =
			items.reduce((sum, item) => sum + item.offsetWidth, 0) +
			gap * Math.max(0, items.length - 1);
		const maxOffset = Math.max(0, contentWidth - viewport.clientWidth);

		return { maxOffset, step };
	}, []);

	const syncButtons = useCallback((offset: number, maxOffset: number) => {
		setCanGoPrev(offset > OFFSET_EPSILON);
		setCanGoNext(offset < maxOffset - OFFSET_EPSILON);
	}, []);

	const animateTo = useCallback((nextOffset: number) => {
		const list = listRef.current;
		if (!list) {
			return;
		}

		const roundedOffset = Math.round(nextOffset);
		offsetRef.current = roundedOffset;
		animationRef.current?.pause();
		animationRef.current = animate(list, {
			translateX: -roundedOffset,
			duration: prefersReducedMotion() ? 0 : CAROUSEL_DURATION,
			ease: CAROUSEL_EASE,
			composition: "replace",
		});
	}, []);

	const goPrev = useCallback(() => {
		const metrics = getMetrics();
		if (!metrics) {
			return;
		}

		const nextOffset = Math.max(0, offsetRef.current - metrics.step);
		if (Math.abs(nextOffset - offsetRef.current) < OFFSET_EPSILON) {
			syncButtons(offsetRef.current, metrics.maxOffset);
			return;
		}

		animateTo(nextOffset);
		syncButtons(nextOffset, metrics.maxOffset);
	}, [animateTo, getMetrics, syncButtons]);

	const goNext = useCallback(() => {
		const metrics = getMetrics();
		if (!metrics) {
			return;
		}

		const nextOffset = Math.min(
			metrics.maxOffset,
			offsetRef.current + metrics.step,
		);
		if (Math.abs(nextOffset - offsetRef.current) < OFFSET_EPSILON) {
			syncButtons(offsetRef.current, metrics.maxOffset);
			return;
		}

		animateTo(nextOffset);
		syncButtons(nextOffset, metrics.maxOffset);
	}, [animateTo, getMetrics, syncButtons]);

	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) {
			return;
		}

		const clampToBounds = () => {
			const metrics = getMetrics();
			if (!metrics) {
				return;
			}

			const nextOffset = Math.min(offsetRef.current, metrics.maxOffset);
			if (Math.abs(nextOffset - offsetRef.current) > OFFSET_EPSILON) {
				animateTo(nextOffset);
			} else {
				offsetRef.current = nextOffset;
			}
			syncButtons(nextOffset, metrics.maxOffset);
		};

		clampToBounds();

		let frame = 0;
		const observer = new ResizeObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(clampToBounds);
		});
		observer.observe(viewport);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			animationRef.current?.pause();
			animationRef.current = null;
		};
	}, [animateTo, getMetrics, syncButtons]);

	return {
		canGoNext,
		canGoPrev,
		goNext,
		goPrev,
		listRef,
		viewportRef,
	};
}

const TestimonialCard: React.FC<{
	testimonial: (typeof TESTIMONIALS)[number];
}> = ({ testimonial }) => {
	return (
		<li className="flex w-[min(22.5rem,100cqw)] shrink-0 flex-col gap-10 rounded-xl bg-primary/30 px-6 py-8">
			<div className="flex items-start justify-between">
				<QuoteIcon
					className="*:fill-muted-foreground *:stroke-muted-foreground"
					size={56}
				/>
				<ul className="flex items-center gap-1">
					{[1, 2, 3, 4, 5].map((item) => (
						<li key={`${testimonial.name}-${item}`}>
							<StarIcon
								className={cn(
									"size-5 text-muted-foreground",
									item <= testimonial.rating
										? "fill-primary text-primary"
										: "fill-muted-foreground/50 text-muted-foreground/50",
								)}
							/>
						</li>
					))}
				</ul>
			</div>
			<p className="text-pretty text-muted-foreground">{testimonial.body}</p>
			<div className="flex items-center gap-2">
				<img
					src={testimonial.profileUrl}
					alt={testimonial.name}
					className="size-10 rounded-full outline outline-black/10 dark:outline-white/10"
				/>
				<div className="flex flex-col">
					<p className="font-medium text-base">{testimonial.name}</p>
					<p className="text-muted-foreground text-sm">{testimonial.class}</p>
				</div>
			</div>
		</li>
	);
};

const TESTIMONIALS = [
	{
		id: "james-grant-1",
		rating: 5,
		profileUrl: "/images/home/testimonials/james-grant.png",
		name: "James Grant",
		class: "College Student",
		body: "HandsFreeSoccer made me fall in love with the game! The coaches are patient and motivating, and the classes are always fun.",
	},
	{
		id: "kale-maison-1",
		rating: 3,
		profileUrl: "/images/home/testimonials/kale-maison.png",
		name: "Kale Maison",
		class: "Marketing Professional",
		body: "The perfect place to start and grow. I improved my technique and also made great friends on the pitch.",
	},
	{
		id: "vera-winsley-1",
		rating: 4,
		profileUrl: "/images/home/testimonials/vera-winsley.png",
		name: "Vera Winsley",
		class: "Software Engineer",
		body: "Their private coaching program boosted my confidence. I even joined my first tournament last year thanks to HandsFreeSoccer.",
	},
	{
		id: "james-grant-2",
		rating: 5,
		profileUrl: "/images/home/testimonials/james-grant.png",
		name: "James Grant",
		class: "College Student",
		body: "HandsFreeSoccer made me fall in love with the game! The coaches are patient and motivating, and the classes are always fun.",
	},
	{
		id: "kale-maison-2",
		rating: 3,
		profileUrl: "/images/home/testimonials/kale-maison.png",
		name: "Kale Maison",
		class: "Marketing Professional",
		body: "The perfect place to start and grow. I improved my technique and also made great friends on the pitch.",
	},
	{
		id: "vera-winsley-2",
		rating: 4,
		profileUrl: "/images/home/testimonials/vera-winsley.png",
		name: "Vera Winsley",
		class: "Software Engineer",
		body: "Their private coaching program boosted my confidence. I even joined my first tournament last year thanks to HandsFreeSoccer.",
	},
	{
		id: "james-grant-3",
		rating: 5,
		profileUrl: "/images/home/testimonials/james-grant.png",
		name: "James Grant",
		class: "College Student",
		body: "HandsFreeSoccer made me fall in love with the game! The coaches are patient and motivating, and the classes are always fun.",
	},
	{
		id: "kale-maison-3",
		rating: 3,
		profileUrl: "/images/home/testimonials/kale-maison.png",
		name: "Kale Maison",
		class: "Marketing Professional",
		body: "The perfect place to start and grow. I improved my technique and also made great friends on the pitch.",
	},
	{
		id: "vera-winsley-3",
		rating: 4,
		profileUrl: "/images/home/testimonials/vera-winsley.png",
		name: "Vera Winsley",
		class: "Software Engineer",
		body: "Their private coaching program boosted my confidence. I even joined my first tournament last year thanks to HandsFreeSoccer.",
	},
];
