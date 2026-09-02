import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import type { V2PaginatedSuccessResponse } from "#/api/http/shared";
import api from "#/api/http/xhr";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Pagination } from "#/components/ui/pagination";
import { useDebounce } from "#/hooks/use-debounce";
import { formatAttendanceDateTime } from "#/lib/admin-attendance";

const SUBJECT_LABELS: Record<string, string> = {
	classes: "Classes",
	schedules: "Schedules",
	enrollment: "Enrollment",
	private: "Private Coaching",
	other: "Other",
};

type AdminContactInquiry = {
	id: number;
	fullName: string;
	email: string;
	subject: string;
	message: string;
	createdAt: string;
};

export function ContactsTab() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const debouncedSearch = useDebounce(search, 300);

	const inquiriesQuery = useQuery({
		queryKey: ["admin-contact-inquiries", page, debouncedSearch],
		queryFn: async () => {
			const params = new URLSearchParams({ page: String(page) });
			if (debouncedSearch) params.set("q", debouncedSearch);
			return (
				await api.get<V2PaginatedSuccessResponse<AdminContactInquiry>>(
					`/admin/contact-inquiries?${params.toString()}`,
				)
			).data;
		},
		placeholderData: keepPreviousData,
	});

	const items = inquiriesQuery.data?.data ?? [];
	const totalPages = inquiriesQuery.data?.meta?.pagination.total_pages ?? 1;
	const total = inquiriesQuery.data?.meta?.pagination.total ?? 0;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-pretty text-muted-foreground text-sm">
					Messages from the contact form, newest first.
				</p>
				<div className="relative w-full sm:max-w-xs">
					<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
						placeholder="Search by name or email"
						aria-label="Search by name or email"
						className="pl-9"
					/>
				</div>
			</div>

			{inquiriesQuery.isLoading && items.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground">
					Loading inquiries...
				</p>
			) : null}

			{!inquiriesQuery.isLoading && items.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground">
					{debouncedSearch
						? "No inquiries match that name or email."
						: "No contact inquiries yet."}
				</p>
			) : null}

			{items.length > 0 ? (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					{items.map((inquiry) => (
						<Card key={inquiry.id} size="sm">
							<CardHeader>
								<CardTitle className="text-balance">{inquiry.fullName}</CardTitle>
								<CardDescription>
									<a
										href={`mailto:${inquiry.email}`}
										className="break-all text-primary underline-offset-4 hover:underline"
									>
										{inquiry.email}
									</a>
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-3">
								<p className="text-muted-foreground text-xs uppercase tracking-wide">
									{SUBJECT_LABELS[inquiry.subject] ?? inquiry.subject}
								</p>
								<p className="whitespace-pre-wrap text-pretty leading-relaxed">
									{inquiry.message}
								</p>
							</CardContent>
							<CardFooter className="text-muted-foreground text-xs tabular-nums">
								{formatAttendanceDateTime(inquiry.createdAt)}
							</CardFooter>
						</Card>
					))}
				</div>
			) : null}

			{total > 0 ? (
				<Pagination page={page} totalPages={totalPages} onChange={setPage} />
			) : null}
		</div>
	);
}
