import { Button } from "#/components/ui/button";

export function Pagination({
	page,
	totalPages,
	onChange,
}: {
	page: number;
	totalPages: number;
	onChange: (page: number) => void;
}) {
	return (
		<div className="flex items-center justify-end gap-2">
			<Button
				size="sm"
				variant="outline"
				disabled={page <= 1}
				onClick={() => onChange(page - 1)}
			>
				Previous
			</Button>
			<span className="text-muted-foreground text-sm">
				Page {page} of {Math.max(totalPages, 1)}
			</span>
			<Button
				size="sm"
				variant="outline"
				disabled={page >= totalPages}
				onClick={() => onChange(page + 1)}
			>
				Next
			</Button>
		</div>
	);
}
