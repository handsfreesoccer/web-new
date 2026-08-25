import { Link, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "#/lib/utils";
import { BOOKING_SECTION_ID, NAV_LINKS } from "../../lib/constants";
import { LogoIcon } from "../icons/logo-icon";
import { Button } from "../ui/button";
import { MenuIcon, type MenuIconHandle } from "../ui/menu";
import { MobileNavDrawer } from "./mobile-nav/MobileNavDrawer";

export function Navbar() {
	const { pathname } = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

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

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			<nav
				className={cn(
					"sticky top-0 z-50 mx-auto flex w-full justify-center bg-white/80 duration-200 ease-in-out",
					isScrolled && "bg-white/80 drop-shadow-sm backdrop-blur-xs",
				)}
			>
				<div className="flex w-full max-w-360 items-center justify-between px-4 py-2 sm:px-8 md:px-16">
					<div className="flex items-center gap-2">
						<Link to="/" aria-label="HandsFree Soccer Academy home">
							<LogoIcon className="h-14 w-auto sm:h-16" />
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
						render={<Link hash={BOOKING_SECTION_ID} to="/" />}
						className="hidden px-6 py-6 font-normal sm:flex"
					>
						Join Us
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="cursor-pointer bg-transparent! p-0 hover:bg-transparent sm:hidden"
						aria-expanded={menuOpen}
						aria-controls="mobile-nav"
						aria-label={menuOpen ? "Close menu" : "Open menu"}
						onClick={toggleMenu}
					>
						<MenuIcon ref={menuIconRef} size={32} />
					</Button>
				</div>
			</nav>
			<MobileNavDrawer
				open={menuOpen}
				pathname={pathname}
				onClose={closeMenu}
			/>
		</>
	);
}
