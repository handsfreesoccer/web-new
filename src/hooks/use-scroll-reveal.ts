import { animate, onScroll, type ScrollObserver, utils } from "animejs";
import { type RefObject, useEffect } from "react";

/**
 * Elements marked with `data-reveal` fade in once as they scroll into view.
 * Values: `"up"` (default), `"fade"`, `"scale"`.
 *
 * Don't put `data-reveal` on elements with CSS transitions on opacity or
 * transform (e.g. `Button`), or that rely on the `transform` property —
 * wrap them instead.
 */
const REVEAL_SELECTOR = "[data-reveal]";
const REVEAL_DURATION = 700;
const REVEAL_STAGGER = 90;
const MAX_STAGGER_STEPS = 5;
const REVEAL_EASE = "outCubic";
/** Route changes and hash links smooth-scroll via Lenis; wait for it to finish. */
const SCROLL_SETTLE_MS = 150;

type RevealVariant = "up" | "fade" | "scale";

const HIDDEN_STATE: Record<RevealVariant, Record<string, number>> = {
	up: { opacity: 0, translateY: 24 },
	fade: { opacity: 0 },
	scale: { opacity: 0, scale: 0.97 },
};

const VISIBLE_STATE: Record<RevealVariant, Record<string, number>> = {
	up: { opacity: 1, translateY: 0 },
	fade: { opacity: 1 },
	scale: { opacity: 1, scale: 1 },
};

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const revealVariant = (element: HTMLElement): RevealVariant => {
	const value = element.dataset.reveal;
	return value === "fade" || value === "scale" ? value : "up";
};

const isInViewport = (element: HTMLElement) => {
	const rect = element.getBoundingClientRect();
	return rect.top < window.innerHeight && rect.bottom > 0;
};

const clearRevealStyles = (element: HTMLElement) => {
	element.style.removeProperty("opacity");
	element.style.removeProperty("transform");
};

const collectRevealTargets = (node: Node) => {
	if (!(node instanceof HTMLElement)) return [];
	const targets = Array.from(
		node.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
	);
	if (node.matches(REVEAL_SELECTOR)) targets.unshift(node);
	return targets;
};

export function useScrollReveal(rootRef: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const root = rootRef.current;
		if (!root || prefersReducedMotion()) {
			return;
		}

		const pending = new Map<HTMLElement, ScrollObserver>();
		const seen = new WeakSet<HTMLElement>();
		let deferred: HTMLElement[] = [];
		let queue: HTMLElement[] = [];
		let frame = 0;
		let settleTimer = 0;

		const flushQueue = () => {
			frame = 0;
			const batch = queue
				.filter((element) => element.isConnected)
				.map((element) => ({ element, rect: element.getBoundingClientRect() }))
				.sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left);
			queue = [];

			batch.forEach(({ element }, index) => {
				pending.get(element)?.revert();
				pending.delete(element);
				animate(element, {
					...VISIBLE_STATE[revealVariant(element)],
					duration: REVEAL_DURATION,
					delay: Math.min(index, MAX_STAGGER_STEPS) * REVEAL_STAGGER,
					ease: REVEAL_EASE,
					onComplete: () => clearRevealStyles(element),
				});
			});
		};

		const observe = (element: HTMLElement) => {
			pending.set(
				element,
				onScroll({
					target: element,
					enter: "bottom top",
					onEnter: () => {
						if (queue.includes(element)) return;
						queue.push(element);
						frame ||= requestAnimationFrame(flushQueue);
					},
				}),
			);
		};

		const observeDeferred = () => {
			const elements = deferred;
			deferred = [];
			for (const element of elements) {
				if (element.isConnected) observe(element);
			}
		};

		const scheduleObserve = () => {
			window.clearTimeout(settleTimer);
			settleTimer = window.setTimeout(observeDeferred, SCROLL_SETTLE_MS);
		};

		const handleScroll = () => {
			if (deferred.length > 0) scheduleObserve();
		};

		const register = (element: HTMLElement, skipIfVisible: boolean) => {
			if (seen.has(element)) return;
			seen.add(element);

			// Content painted by SSR stays put; only content below the fold animates.
			if (skipIfVisible && isInViewport(element)) return;

			utils.set(element, HIDDEN_STATE[revealVariant(element)]);
			deferred.push(element);
			scheduleObserve();
		};

		const releaseDetached = () => {
			for (const [element, observer] of pending) {
				if (element.isConnected) continue;
				observer.revert();
				pending.delete(element);
			}
		};

		for (const element of collectRevealTargets(root)) {
			register(element, true);
		}

		const mutationObserver = new MutationObserver((mutations) => {
			let hasRemovals = false;
			for (const mutation of mutations) {
				if (mutation.removedNodes.length > 0) hasRemovals = true;
				for (const node of mutation.addedNodes) {
					for (const element of collectRevealTargets(node)) {
						register(element, false);
					}
				}
			}
			if (hasRemovals) releaseDetached();
		});
		mutationObserver.observe(root, { childList: true, subtree: true });
		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			mutationObserver.disconnect();
			window.removeEventListener("scroll", handleScroll);
			window.clearTimeout(settleTimer);
			cancelAnimationFrame(frame);
			for (const [element, observer] of pending) {
				observer.revert();
				clearRevealStyles(element);
			}
			for (const element of deferred) clearRevealStyles(element);
			pending.clear();
			deferred = [];
			queue = [];
		};
	}, [rootRef]);
}
