import { PlayIcon } from "lucide-react";
import type React from "react";
import { Button } from "#/components/ui/button";

export const IntroVideo: React.FC = () => {
	return (
		<section className="mx-auto flex max-w-360 flex-col gap-16 px-4 py-8 sm:px-8 sm:py-16 md:px-16">
			<div className="grid h-96 place-items-center rounded-3xl bg-secondary sm:h-140">
				<Button className="group size-16 cursor-pointer rounded-full bg-white p-0 duration-200 hover:scale-110 sm:size-20">
					<PlayIcon className="size-8 fill-primary group-hover:fill-white group-hover:text-primary sm:size-10" />
				</Button>
			</div>
		</section>
	);
};
