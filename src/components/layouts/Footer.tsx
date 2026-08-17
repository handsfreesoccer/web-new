import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
	ArrowRightIcon,
	MailIcon,
	MapPinIcon,
	PhoneCallIcon,
	PhoneIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NAV_LINKS } from "#/lib/constants";
import { FacebookIcon } from "../icons/facebook-icon";
import { InstagramIcon } from "../icons/instagram-icon";

export const Footer: React.FC = () => {
	return (
		<footer className="p-4 sm:p-8 md:p-16">
			<div className="bg-primary rounded-3xl flex flex-col gap-8 p-12 pb-8">
				<div className="flex justify-between gap-8 md:gap-16 md:flex-row flex-col">
					<div className="flex flex-col gap-4">
						<h2 className="text-white text-2xl font-semibold">
							Stay Updated with <br /> special offers from us!
						</h2>
						<p className="font-light tracking-wider text-muted">
							Coaching every player, at every level, in every stage of the game
						</p>
					</div>
					<div className="flex items-center px-0.75 h-fit rounded-full bg-white transition-shadow focus-within:ring-3 focus-within:ring-ring/30 flex-1 max-w-xs md:min-w-xs">
						<Input
							type="email"
							placeholder="Enter your email here"
							className="rounded-full border-0 bg-transparent py-5 shadow-none focus-visible:border-transparent focus-visible:ring-0"
						/>
						<Button
							type="submit"
							className=""
						>
							<ArrowRightIcon />
						</Button>
					</div>
				</div>
				<hr className="block h-px w-full origin-center scale-y-[0.5] border-0 bg-white" />
				<div className="grid grid-cols-10">
					<div className="flex flex-col gap-4 col-span-6">
						<div className="flex flex-col gap-3">
							<Link to="/">
								<div className="h-18 w-25 bg-white" />
							</Link>
							<p className="text-white font-light tracking-wider">
								Coaching every player, at every level, in every stage of the
								game
							</p>
						</div>
						<ul className="flex items-center gap-2">
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
					<div className="col-span-2 flex flex-col gap-3">
						<h3 className="text-white text-lg font-semibold">Quick Links</h3>
						<ul className="flex flex-col gap-2">
							{NAV_LINKS.map((link) => (
								<li key={link.to}>
									<Link
										to={link.to as "/"}
										className="text-white font-light hover:font-semibold duration-300 ease-in-out"
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
							<li className="flex items-center gap-2">
								<MapPinIcon className="text-white size-4" />
								<p className="text-white font-light tracking-wider">
									Chandigarh, India
								</p>
							</li>
							<li className="flex items-center gap-2">
								<PhoneIcon className="text-white size-4" />
								<p className="text-white font-light tracking-wider">
									handsfreesoccer@gmail.com
								</p>
							</li>
							<li className="flex items-center gap-2">
								<MailIcon className="text-white size-4" />
								<p className="text-white font-light tracking-wider">
									info@handsfreesoccer.com
								</p>
							</li>
						</ul>
					</div>
				</div>
				<hr className="block h-px w-full origin-center scale-y-[0.5] border-0 bg-white" />
				<p className="text-white text-center text-base tracking-wider">
					&copy; {new Date().getFullYear()} HandsfreeSoccer. All rights
					reserved.
				</p>
			</div>
		</footer>
	);
};
