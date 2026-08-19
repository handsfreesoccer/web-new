import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { cn } from "#/lib/utils";
import { NAV_LINKS } from "../../../lib/constants";
import { useMobileNavTimeline } from "./use-mobile-nav-timeline";

type MobileNavDrawerProps = {
	open: boolean;
	pathname: string;
	onClose: () => void;
};

export function MobileNavDrawer({
	open,
	pathname,
	onClose,
}: MobileNavDrawerProps) {
	const panelRef = useRef<HTMLElement>(null);

	useMobileNavTimeline(panelRef, open);

	useEffect(() => {
		if (!open) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [open, onClose]);

	return (
		<aside
			ref={panelRef}
			id="mobile-nav"
			aria-hidden={!open}
			className={cn(
				"transform-[translate3d(100%,0,0)] fixed inset-0 z-40 w-full bg-background will-change-transform sm:hidden",
				open ? "pointer-events-auto" : "pointer-events-none",
			)}
		>
			<nav className="flex h-full w-full items-center justify-center px-6">
				<ul className="flex flex-col items-center gap-8 text-center">
					{NAV_LINKS.map((link) => (
						<li key={link.to}>
							<Link
								to={link.to as "/"}
								data-mobile-nav-link
								onClick={onClose}
								className={cn(
									"text-pretty font-heading text-2xl text-muted-foreground opacity-0 duration-300 ease-in-out hover:font-semibold hover:text-primary",
									link.to === pathname &&
										"font-medium text-primary hover:font-semibold",
								)}
							>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}
