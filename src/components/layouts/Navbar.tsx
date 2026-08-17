import { Link, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "#/lib/utils";
import { Button } from "../ui/button";
import { MenuIcon, type MenuIconHandle } from "../ui/menu";
import { MobileNavDrawer } from "./mobile-nav/MobileNavDrawer";
import { NAV_LINKS } from "./nav-links";

export function Navbar() {
	const { pathname } = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuIconRef = useRef<MenuIconHandle>(null);

	const closeMenu = useCallback(() => {
		setMenuOpen(false);
		menuIconRef.current?.stopAnimation();
	}, []);

	const toggleMenu = useCallback(() => {
		setMenuOpen((isOpen) => {
			const nextOpen = !isOpen;
			if (nextOpen) {
				menuIconRef.current?.startAnimation();
			} else {
				menuIconRef.current?.stopAnimation();
			}
			return nextOpen;
		});
	}, []);

	useEffect(() => {
		closeMenu();
	}, [pathname, closeMenu]);

	useEffect(() => {
		const media = window.matchMedia("(min-width: 640px)");
		const onChange = () => {
			if (media.matches) {
				closeMenu();
			}
		};

		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [closeMenu]);

	return (
		<>
			<nav className="relative z-50 flex w-full max-w-360 items-center justify-between px-4 py-2 sm:px-16">
				<div className="flex items-center gap-2">
					<Link to="/">
						<div className="h-18 w-25 bg-black/10" />
					</Link>
				</div>
				<ul className="hidden items-center gap-10 sm:flex">
					{NAV_LINKS.map((link) => (
						<li key={link.to}>
							<Link
								to={link.to as "/"}
								className={cn(
									"text-muted-foreground duration-300 ease-in-out hover:font-semibold hover:text-primary",
									link.to === pathname && "font-medium text-primary",
								)}
							>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
				<Button
					nativeButton={false}
					render={<Link to={"/contact" as never} />}
					className="hidden px-6 py-6 font-normal sm:block"
				>
					Contact Us
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon-lg"
					className="sm:hidden p-0"
					aria-expanded={menuOpen}
					aria-controls="mobile-nav"
					aria-label={menuOpen ? "Close menu" : "Open menu"}
					onClick={toggleMenu}
				>
					<MenuIcon
						ref={menuIconRef}
						size={32}
					/>
				</Button>
			</nav>
			<MobileNavDrawer
				open={menuOpen}
				pathname={pathname}
				onClose={closeMenu}
			/>
		</>
	);
}
