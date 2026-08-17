import { Link, useLocation } from "@tanstack/react-router";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "#/lib/utils";

export const Navbar: React.FC = () => {
	const { pathname } = useLocation();
	return (
		<nav className="flex items-center justify-between max-w-360 mx-auto w-full px-16 py-2">
			<div className="flex items-center gap-2">
				<Link to="/">
					<div className="w-25 h-18 bg-black/10"></div>
				</Link>
			</div>
			<ul className="flex items-center gap-10">
				{NAV_LINKS.map((link) => (
					<li key={link.to}>
						<Link
							to={link.to}
							className={cn(
								"hover:text-primary duration-300 ease-in-out hover:font-semibold text-muted-foreground",
								link.to === pathname && "text-primary font-medium",
							)}
						>
							{link.label}
						</Link>
					</li>
				))}
			</ul>
			<Button
				nativeButton={false}
				render={<Link to="/contact" />}
				className="font-normal py-6 px-6"
			>
				Contact Us
			</Button>
		</nav>
	);
};

const NAV_LINKS = [
	{
		label: "Home",
		to: "/",
	},
	{
		label: "About Us",
		to: "/about",
	},
	{
		label: "Contact",
		to: "/contact-us",
	},
];
