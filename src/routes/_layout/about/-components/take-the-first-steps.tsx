import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import type React from "react";
import { Button } from "#/components/ui/button";

export const TakeTheFirstSteps: React.FC = () => {
	return (
		<section className="mx-auto flex flex-col items-center gap-16 overflow-hidden px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="relative w-full max-w-360 overflow-hidden rounded-3xl">
				<img
					src="https://placehold.co/600x480/black/black"
					alt="Hero Section"
					className="absolute h-full w-full object-cover"
				/>
				<div className="relative flex flex-1 flex-col items-center justify-between gap-8 p-8 sm:items-start sm:gap-24 sm:p-16">
					<h1 className="max-w-[15ch] text-balance text-center font-bold text-4xl text-white leading-tight sm:text-left sm:text-7xl">
						TAKE THE FIRST STEPS TODAY
					</h1>
					<div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
						<p className="max-w-[32ch] text-muted-foreground">
							Train with expert coaches, access world-class courts, and build
							skills step by step.
						</p>
						<Button
							nativeButton={false}
							render={<Link to={"/join" as never} />}
							className="h-auto w-fit gap-2 rounded-full p-1 pl-4"
						>
							<p>Get Started Now</p>
							<span className="grid size-11 place-content-center rounded-full bg-white">
								<ArrowRightIcon className="size-4 text-primary" />
							</span>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
};
