import { Skeleton } from "#/components/ui/skeleton";
import { ASPECT_CLASS, type GalleryAspect } from "#/lib/gallery";
import { cn } from "#/lib/utils";

export function GalleryMasonrySkeleton({
	aspect = "landscape",
}: {
	aspect?: GalleryAspect;
}) {
	return (
		<figure className="mb-6 break-inside-avoid" aria-hidden>
			<Skeleton className={cn("w-full", ASPECT_CLASS[aspect])} />
		</figure>
	);
}
