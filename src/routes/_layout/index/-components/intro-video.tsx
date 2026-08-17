import { Button } from "#/components/ui/button";
import { PlayIcon } from "lucide-react";
import React from "react";

export const IntroVideo: React.FC = () => {
	return (
		<section className="max-w-360 mx-auto px-4 py-8 sm:py-16 sm:px-8 md:px-16 flex flex-col gap-16">
			<div className="bg-secondary rounded-3xl h-96 sm:h-140 grid place-items-center">
				<Button className="bg-white p-0 size-16 sm:size-20 rounded-full group cursor-pointer hover:scale-110 duration-200">
					<PlayIcon className="size-8 sm:size-10 fill-primary group-hover:fill-white group-hover:text-primary" />
				</Button>
			</div>
		</section>
	);
};
