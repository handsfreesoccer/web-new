import {
	OTPInput,
	OTPInputContext,
	type OTPInputProps,
	REGEXP_ONLY_DIGITS,
} from "input-otp";
import type { ComponentProps } from "react";
import { useContext } from "react";
import { cn } from "#/lib/utils";

export function InputOTP({ className, ...props }: OTPInputProps) {
	return (
		<OTPInput
			containerClassName={cn("flex items-center gap-2", className)}
			className="disabled:cursor-not-allowed"
			pattern={REGEXP_ONLY_DIGITS}
			{...props}
		/>
	);
}

export function InputOTPGroup({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("flex items-center", className)} {...props} />;
}

export function InputOTPSlot({
	index,
	className,
	...props
}: ComponentProps<"div"> & { index: number }) {
	const { slots } = useContext(OTPInputContext);
	const slot = slots[index];
	return (
		<div
			data-index={index}
			className={cn(
				"grid size-11 place-items-center border border-input bg-white text-lg font-semibold text-secondary shadow-sm first:rounded-l-xl last:rounded-r-xl",
				slot?.isActive && "border-primary ring-2 ring-primary/20",
				className,
			)}
			{...props}
		>
			{slot?.char}
		</div>
	);
}
