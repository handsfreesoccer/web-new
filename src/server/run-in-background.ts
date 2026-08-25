/** Fire-and-forget async work — errors are logged, never thrown to the caller. */
export function runInBackground(label: string, task: () => Promise<void>) {
	void task().catch((error) => {
		console.error(
			`[${label}]`,
			error instanceof Error ? error.message : error,
		);
	});
}
