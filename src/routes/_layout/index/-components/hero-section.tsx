import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import type React from "react";
import { Button } from "#/components/ui/button";

export const HeroSection: React.FC = () => {
	return (
		<section className="mx-auto flex max-w-360 flex-col gap-16 px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<h1 className="@container w-full text-center font-bold text-[min(4.5rem,calc(90cqi/11))] leading-tight">
				<span className="block">ACE YOUR GAME WITH</span>
				<span className="block whitespace-nowrap">HANDSFREESOCCER</span>
			</h1>
			<div className="relative flex w-full flex-1 flex-col overflow-clip rounded-3xl bg-black py-0 sm:min-h-120 sm:py-0">
				<img
					src="https://placehold.co/600x480/black/black"
					alt="Hero Section"
					className="absolute h-full w-full object-cover"
				/>
				<div className="relative flex h-full flex-1 flex-col justify-evenly gap-8 p-8 sm:justify-start sm:gap-0">
					<div className="grid place-content-center sm:flex-1">
						<h2 className="flex-1 text-center font-bold text-[min(4.5rem,calc(90cqi/11))] text-white leading-tight">
							GAME STARTS HERE
						</h2>
					</div>
					<div className="flex flex-col items-center justify-between gap-10 sm:flex-row">
						<p className="w-full text-center text-base text-white sm:w-1/2 sm:text-balance sm:text-left sm:text-sm">
							Train with experts coaches, access to standard training
							facilities, latest equipment and build skills step by step whether
							you are just starting or training for a competition
						</p>
						<Button
							nativeButton={false}
							render={<Link to={"/join" as never} />}
							className="h-auto w-fit gap-2 rounded-full bg-white p-1 pl-4 text-foreground hover:bg-white"
						>
							<p>Join Now</p>
							<span className="grid size-11 place-content-center rounded-full bg-primary">
								<ArrowRightIcon className="size-4 text-primary-foreground" />
							</span>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
};
