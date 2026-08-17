import { Link } from "@tanstack/react-router";
import React from "react";
import { Button } from "../ui/button";

export const Navbar: React.FC = () => {
	return (
		<nav className="flex items-center justify-between max-w-360 mx-auto w-full px-16 py-2">
			<div className="flex items-center gap-2">
				<Link to="/">
					<div className="w-25 h-18 bg-black/10"></div>
				</Link>
			</div>
			<ul className="flex items-center gap-2">
				<li>
					<Link to="/">Home</Link>
				</li>
				<li>
					<Link to="/about">About</Link>
				</li>
			</ul>
			<Button
				variant="outline"
				asChild
			>
				<Link to="/contact">Contact</Link>
			</Button>
		</nav>
	);
};
