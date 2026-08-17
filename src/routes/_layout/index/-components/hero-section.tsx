import { Button } from "#/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import React from "react";

export const HeroSection: React.FC = () => {
	return (
		<section className=" max-w-360 mx-auto px-4 py-16 sm:px-8 md:px-16 flex flex-col gap-16">
			<h1 className="@container w-full text-center font-bold leading-tight text-[min(4.5rem,calc(90cqi/11))]">
				<span className="block">ACE YOUR GAME WITH</span>
				<span className="block whitespace-nowrap">HANDSFREESOCCER</span>
			</h1>
			<div className="rounded-3xl flex-1 sm:min-h-120 py-0 sm:py-0 w-full overflow-clip relative flex flex-col bg-black">
				<img
					src="https://placehold.co/600x480/black/black"
					alt="Hero Section"
					className="w-full h-full object-cover absolute "
				/>
				<div className="flex flex-col h-full relative flex-1 p-8 justify-evenly gap-8 sm:gap-0 sm:justify-start ">
					<div className="sm:flex-1 grid place-content-center">
						<h2 className="text-[min(4.5rem,calc(90cqi/11))] font-bold text-white flex-1 text-center leading-tight">
							GAME STARTS HERE
						</h2>
					</div>
					<div className="justify-between flex items-center gap-10 flex-col sm:flex-row">
						<p className="sm:w-1/2 w-full text-base sm:text-sm text-white text-center sm:text-left sm:text-balance">
							Train with experts coaches, access to standard training
							facilities, latest equipment and build skills step by step whether
							you are just starting or training for a competition
						</p>
						<div className="bg-white rounded-full flex items-center gap-2 p-1 pl-4">
							<p>Join Now</p>
							<Button
								type="submit"
								className="rounded-full p-0 size-11"
							>
								<ArrowRightIcon />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
