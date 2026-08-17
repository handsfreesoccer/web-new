import { createTimeline, stagger, utils, type Timeline } from "animejs";
import { useEffect, useRef, type RefObject } from "react";

const PANEL_EASE = "outCubic";
const LINK_EASE = "outQuad";

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useMobileNavTimeline(
	panelRef: RefObject<HTMLElement | null>,
	open: boolean,
) {
	const timelineRef = useRef<Timeline | null>(null);
	const hasPlayedRef = useRef(false);

	useEffect(() => {
		const panel = panelRef.current;
		if (!panel) {
			return;
		}

		const links = panel.querySelectorAll<HTMLElement>("[data-mobile-nav-link]");
		const reduced = prefersReducedMotion();
		const panelDuration = reduced ? 0 : 520;
		const linkDuration = reduced ? 0 : 380;
		const linkStagger = reduced ? 0 : 100;
		const linkOffset = reduced ? 0 : 140;

		utils.set(links, {
			opacity: 0,
			translateY: 12,
			filter: "blur(4px)",
		});

		const timeline = createTimeline({
			autoplay: false,
			defaults: { ease: PANEL_EASE },
		});

		timeline.add(
			panel,
			{
				translateX: ["100%", "0%"],
				duration: panelDuration,
			},
			0,
		);

		if (links.length > 0) {
			timeline.add(
				links,
				{
					opacity: [0, 1],
					translateY: [12, 0],
					filter: ["blur(4px)", "blur(0px)"],
					ease: LINK_EASE,
					duration: linkDuration,
					delay: stagger(linkStagger),
				},
				linkOffset,
			);
		}

		timelineRef.current = timeline;

		return () => {
			timeline.revert();
			timelineRef.current = null;
			hasPlayedRef.current = false;
		};
	}, [panelRef]);

	useEffect(() => {
		const timeline = timelineRef.current;
		if (!timeline) {
			return;
		}

		if (open) {
			hasPlayedRef.current = true;
			timeline.play();
			return;
		}

		if (hasPlayedRef.current) {
			timeline.reverse();
		}
	}, [open]);
}
