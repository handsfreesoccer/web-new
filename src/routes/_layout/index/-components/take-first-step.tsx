import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import type React from "react";
import { Button } from "#/components/ui/button";

export const TakeFirstStep: React.FC = () => {
	return (
		<section className="mx-auto flex max-w-360 flex-col gap-12 px-4 py-8 sm:gap-16 sm:px-8 sm:py-16 md:px-16">
			<div className="relative flex w-full flex-1 items-center overflow-clip rounded-3xl bg-black py-0 sm:min-h-120 sm:py-0">
				<img
					src="https://placehold.co/600x480/black/black"
					alt="Hero Section"
					className="absolute h-full w-full object-cover"
				/>
				<div className="relative flex h-full flex-1 flex-col items-center gap-8 p-8 sm:gap-8">
					<div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-1">
						<h2 className="max-w-[12ch] flex-1 text-pretty text-center font-bold text-[min(4.5rem,calc(90cqi/11))] text-white leading-tight">
							TAKE THE FIRST STEP TODAY
						</h2>
						<p className="w-full text-center text-sm text-white sm:w-[65ch] sm:text-base">
							Train with expert coaches, access world-class pitches, and build
							skills step by step, whether you're a beginner or aiming for
							competition.
						</p>
					</div>
					<Button
						nativeButton={false}
						render={<Link to={"/join" as never} />}
						className="h-auto w-fit gap-2 rounded-full bg-white p-1 pl-4 text-foreground hover:bg-white"
					>
						<p>Get Started Now</p>
						<span className="grid size-11 place-content-center rounded-full bg-primary">
							<ArrowRightIcon className="size-4 text-primary-foreground" />
						</span>
					</Button>
				</div>
			</div>
		</section>
	);
};
