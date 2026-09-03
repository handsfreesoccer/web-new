import { Skeleton } from "#/components/ui/skeleton";
import { ASPECT_CLASS, type GalleryAspect } from "#/lib/gallery";
import { cn } from "#/lib/utils";

export function GalleryMasonrySkeleton({
	aspect = "landscape",
	className,
}: {
	aspect?: GalleryAspect;
	className?: string;
}) {
	return (
		<figure className={cn("mb-6 break-inside-avoid", className)} aria-hidden>
			<Skeleton className={cn("w-full", ASPECT_CLASS[aspect])} />
		</figure>
	);
}
