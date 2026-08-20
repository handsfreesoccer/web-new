import { useLocation } from "@tanstack/react-router";
import { useLenis } from "lenis/react";
import { useEffect } from "react";

export function useHashScroll(sectionId: string) {
	const hash = useLocation({ select: (location) => location.hash });
	const lenis = useLenis();

	useEffect(() => {
		const target = hash.replace(/^#/, "");
		if (target !== sectionId) {
			return;
		}

		const frame = requestAnimationFrame(() => {
			const selector = `#${sectionId}`;
			if (lenis) {
				lenis.scrollTo(selector);
				return;
			}
			document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
		});

		return () => cancelAnimationFrame(frame);
	}, [hash, lenis, sectionId]);
}
