// Runs `action` for every item in sequence, tolerating individual failures
// (e.g. one item's delete is blocked by a foreign-key relationship) rather
// than aborting the whole batch — used by every list page's bulk actions to
// report "N updated, M failed" instead of an all-or-nothing result.
export async function runBulkAction<T>(
  items: T[],
  action: (item: T) => Promise<void>
): Promise<{ succeeded: number; failed: number }> {
  let succeeded = 0;
  let failed = 0;
  for (const item of items) {
    try {
      await action(item);
      succeeded++;
    } catch {
      failed++;
    }
  }
  return { succeeded, failed };
}

export function bulkResultMessage(succeeded: number, failed: number, verb: string): string {
  return `${succeeded} ${verb}.${failed > 0 ? ` ${failed} failed.` : ""}`;
}
