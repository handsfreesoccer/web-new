import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowRightIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NAV_LINKS } from "#/lib/constants";
import { FacebookIcon } from "../icons/facebook-icon";
import { InstagramIcon } from "../icons/instagram-icon";

export const Footer: React.FC = () => {
	return (
		<footer className="p-4 sm:p-8 md:p-16">
			<div className="bg-primary rounded-3xl flex flex-col gap-8 pb-6 p-8 sm:p-12 sm:pb-8">
				<div className="flex justify-between gap-8 md:gap-16 md:flex-row flex-col">
					<div className="flex flex-col gap-4 items-center sm:items-start">
						<h2 className="text-white text-2xl font-semibold sm:text-left text-center">
							Stay Updated with <br /> special offers from us!
						</h2>
						<p className="font-light tracking-wider text-secondary-foreground sm:text-left text-center">
							Coaching every player, at every level, in every stage of the game
						</p>
					</div>
					<div className="flex items-center px-0.75 py-1 rounded-full bg-white transition-shadow focus-within:ring-3 focus-within:ring-ring/30 flex-1 sm:max-w-xs md:min-w-xs self-center sm:self-start w-full">
						<Input
							type="email"
							placeholder="Enter your email here"
							className="rounded-full border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
						/>
						<Button
							type="submit"
							className="rounded-full p-0 size-12"
						>
							<ArrowRightIcon />
						</Button>
					</div>
				</div>
				<hr className="block h-px w-full origin-center scale-y-[0.5] border-0 bg-white" />
				<div className="flex justify-between flex-wrap gap-4 sm:gap-8">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-3 items-center sm:items-start">
							<Link to="/">
								<div className="h-18 w-25 bg-white" />
							</Link>
							<p className="text-white font-light tracking-wider text-center sm:text-left">
								Coaching every player, at every level, in every stage of the
								game
							</p>
						</div>
						<ul className="items-center gap-2 hidden sm:flex">
							<li>
								<a
									href="https://www.facebook.com/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<FacebookIcon className="text-white size-8" />
								</a>
							</li>
							<li>
								<a
									href="https://www.instagram.com/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<InstagramIcon className="text-white size-8" />
								</a>
							</li>
						</ul>
					</div>
					<div className="flex gap-6 sm:gap-12 justify-between flex-wrap">
						<div className="col-span-2 flex flex-col gap-3">
							<h3 className="text-white text-lg font-semibold">Quick Links</h3>
							<ul className="flex flex-col gap-2">
								{NAV_LINKS.map((link) => (
									<li key={link.to}>
										<Link
											to={link.to as "/"}
											className="text-secondary-foreground font-light hover:font-semibold duration-300 ease-in-out"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
						<div className="col-span-2 flex flex-col gap-3">
							<h3 className="text-white text-lg font-semibold">Contact</h3>
							<ul className="flex flex-col gap-2">
								<li>
									<a
										href="https://www.google.com/maps/search/?api=1&query=Chandigarh%2C%20India"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-secondary-foreground font-light tracking-wider hover:font-semibold duration-300 ease-in-out"
									>
										<MapPinIcon className="size-4 shrink-0" />
										Chandigarh, India
									</a>
								</li>
								<li>
									<a
										href="tel:+919876543210"
										className="flex items-center gap-2 text-secondary-foreground font-light tracking-wider hover:font-semibold duration-300 ease-in-out"
									>
										<PhoneIcon className="size-4 shrink-0" />
										+91 9876543210
									</a>
								</li>
								<li className="flex items-center gap-2">
									<MailIcon className="text-white size-4 shrink-0" />
									<p className="text-secondary-foreground font-light tracking-wider">
										info@handsfreesoccer.com
									</p>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<ul className="items-center gap-2 sm:hidden flex justify-center">
					<li>
						<a
							href="https://www.facebook.com/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FacebookIcon className="text-white size-8" />
						</a>
					</li>
					<li>
						<a
							href="https://www.instagram.com/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<InstagramIcon className="text-white size-8" />
						</a>
					</li>
				</ul>
				<hr className="block h-px w-full origin-center scale-y-[0.5] border-0 bg-white" />
				<p className="text-white text-center text-base tracking-wider">
					&copy; {new Date().getFullYear()} HandsfreeSoccer. All rights
					reserved.
				</p>
			</div>
		</footer>
	);
};
