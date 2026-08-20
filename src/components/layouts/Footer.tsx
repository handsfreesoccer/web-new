import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type React from "react";
import { CONTACT, NAV_LINKS } from "#/lib/constants";
import { FacebookIcon } from "../icons/facebook-icon";
import { InstagramIcon } from "../icons/instagram-icon";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const Footer: React.FC = () => {
	return (
		<footer className="p-4 sm:p-8 md:p-16">
			<div className="flex flex-col gap-8 rounded-3xl bg-primary p-8 pb-6 sm:p-12 sm:pb-8">
				<div className="flex flex-col justify-between gap-8 md:flex-row md:gap-16">
					<div className="flex flex-col items-center gap-4 sm:items-start">
						<h2 className="text-center font-semibold text-2xl text-white sm:text-left">
							Stay Updated with <br /> special offers from us!
						</h2>
						<p className="text-center font-light text-secondary-foreground tracking-wider sm:text-left">
							Coaching every player, at every level, in every stage of the game
						</p>
					</div>
					<div className="flex w-full flex-1 items-center self-center rounded-full bg-white px-0.75 py-1 transition-shadow focus-within:ring-3 focus-within:ring-ring/30 sm:max-w-xs sm:self-start md:min-w-xs">
						<form
							action={`mailto:${CONTACT.email}`}
							method="post"
							encType="text/plain"
							className="flex w-full items-center"
						>
							<Input
								type="email"
								name="email"
								placeholder="Enter your email here"
								className="rounded-full border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
							/>
							<Button type="submit" className="size-11 rounded-full p-0">
								<ArrowRightIcon />
							</Button>
						</form>
					</div>
				</div>
				<hr className="block h-px w-full origin-center scale-y-[0.5] border-0 bg-white" />
				<div className="flex flex-wrap justify-between gap-4 sm:gap-8">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col items-center gap-3 sm:items-start">
							<Link to="/">
								<div className="h-18 w-25 bg-white" />
							</Link>
							<p className="text-center font-light text-white tracking-wider sm:text-left">
								Coaching every player, at every level, in every stage of the
								game
							</p>
						</div>
						<ul className="hidden items-center gap-2 sm:flex">
							<li>
								<a
									href="https://www.facebook.com/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<FacebookIcon className="size-8 text-white" />
								</a>
							</li>
							<li>
								<a
									href="https://www.instagram.com/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<InstagramIcon className="size-8 text-white" />
								</a>
							</li>
						</ul>
					</div>
					<div className="flex flex-wrap justify-between gap-6 sm:gap-12">
						<div className="col-span-2 flex flex-col gap-3">
							<h3 className="font-semibold text-lg text-white">Quick Links</h3>
							<ul className="flex flex-col gap-2">
								{NAV_LINKS.map((link) => (
									<li key={link.to}>
										<Link
											to={link.to as "/"}
											className="font-light text-secondary-foreground duration-300 ease-in-out hover:font-semibold"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
						<div className="col-span-2 flex flex-col gap-3">
							<h3 className="font-semibold text-lg text-white">Contact</h3>
							<ul className="flex flex-col gap-2">
								<li>
									<a
										href="https://www.google.com/maps/search/?api=1&query=Allen%2C%20McKinney%2C%20Melissa%2C%20Princeton%2C%20TX"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 font-light text-secondary-foreground tracking-wider duration-300 ease-in-out"
									>
										<MapPinIcon className="size-4 shrink-0" />
										{CONTACT.serviceArea}
									</a>
								</li>
								<li>
									<a
										href={`tel:${CONTACT.phoneHref}`}
										className="flex items-center gap-2 font-light text-secondary-foreground tracking-wider duration-300 ease-in-out"
									>
										<PhoneIcon className="size-4 shrink-0" />
										{CONTACT.phone}
									</a>
								</li>
								<li>
									<p className="flex items-center gap-2 font-light text-secondary-foreground tracking-wider duration-300 ease-in-out">
										<MailIcon className="size-4 shrink-0 text-white" />
										{CONTACT.email}
									</p>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<ul className="flex items-center justify-center gap-2 sm:hidden">
					<li>
						<a
							href="https://www.facebook.com/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FacebookIcon className="size-8 text-white" />
						</a>
					</li>
					<li>
						<a
							href="https://www.instagram.com/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<InstagramIcon className="size-8 text-white" />
						</a>
					</li>
				</ul>
				<hr className="block h-px w-full origin-center scale-y-[0.5] border-0 bg-white" />
				<p className="text-center text-base text-white tracking-wider">
					&copy; {new Date().getFullYear()} HandsFree Soccer Academy. All rights
					reserved.
				</p>
			</div>
		</footer>
	);
};
