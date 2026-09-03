import { useEffect, useRef, useState } from "react";

const DEFAULT_ROOT_MARGIN = "320px 0px";

export function useLazyInView(rootMargin = DEFAULT_ROOT_MARGIN) {
	const ref = useRef<HTMLDivElement>(null);
	const [isInView, setIsInView] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node || isInView) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setIsInView(true);
					observer.disconnect();
				}
			},
			{ rootMargin, threshold: 0 },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [isInView, rootMargin]);

	return { ref, isInView };
}
