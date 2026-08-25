import type { ImgHTMLAttributes } from "react";
import { cn } from "#/lib/utils";

type LogoIconProps = ImgHTMLAttributes<HTMLImageElement>;

export const LogoIcon = ({
	alt = "HandsFree Soccer Academy",
	className,
	...props
}: LogoIconProps) => {
	return (
		<img
			src="/brand/logo.svg"
			alt={alt}
			className={cn("h-auto w-auto object-contain", className)}
			{...props}
		/>
	);
};
