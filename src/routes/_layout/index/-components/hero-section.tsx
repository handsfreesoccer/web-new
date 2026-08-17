import React from "react";

export const HeroSection: React.FC = () => {
	return (
		<section className=" max-w-360 mx-auto px-4 py-16 sm:px-8 md:px-16 flex flex-col gap-16">
			<h1 className="text-7xl font-bold text-center leading-tight">
				ACE YOUR GAME WITH
				<br />
				HANDSFREESOCCER
			</h1>
			<div className="rounded-3xl flex-1 min-h-120 w-full overflow-clip relative">
				<img
					src="https://placehold.co/600x480"
					alt="Hero Section"
					className="w-full h-full object-cover object-center absolute"
				/>
				<div className="flex flex-col h-full">
					<div className="justify-between flex items-center"></div>
				</div>
			</div>
		</section>
	);
};
