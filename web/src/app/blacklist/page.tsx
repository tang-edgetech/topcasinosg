import type { Metadata } from "next";
import { getBlacklistEntries } from "./_lib/api";
import { sanitizeRichText } from "@/lib/sanitize-html";

export const metadata: Metadata = {
  title: "Blacklisted Casinos | Top Casino SG",
  description:
    "Casinos flagged for scams, non-payment, or other serious trust and safety issues. Check before you deposit.",
};

function WarningIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
      />
    </svg>
  );
}

function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 4.5 6v6c0 4.97 3.2 8.6 7.5 9 4.3-.4 7.5-4.03 7.5-9V6L12 3Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default async function BlacklistPage() {
  const entries = await getBlacklistEntries();

  return (
    <div id="blacklist-page" className="blacklist-page flex flex-1 flex-col bg-white">
      <div
        id="blacklist-page-header"
        className="blacklist-page__header border-b border-danger/20 bg-danger/5"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger text-white">
              <WarningIcon className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
              Blacklisted Casinos
            </h1>
          </div>
          <p className="max-w-3xl text-base text-primary-600">
            These operators have been flagged for scams, refusal to pay out winnings, or other
            serious trust and safety violations. We publish this list to help you avoid them —
            always double-check an operator here before you deposit anywhere.
          </p>
        </div>
      </div>

      <div
        id="blacklist-page-content"
        className="blacklist-page__content mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-8"
      >
        {entries.length === 0 ? (
          <div
            id="blacklist-empty-state"
            className="blacklist-empty-state flex flex-col items-center gap-3 rounded-lg border border-primary-100 bg-surface-muted px-6 py-16 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <ShieldCheckIcon className="h-7 w-7" />
            </span>
            <p className="text-lg font-semibold text-primary-900">
              No casinos are currently blacklisted.
            </p>
            <p className="max-w-md text-sm text-primary-500">
              We&apos;ll list any operator here the moment we confirm a serious trust or safety
              issue. Check back any time.
            </p>
          </div>
        ) : (
          <ul id="blacklist-entries" className="blacklist-entries flex flex-col gap-6">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="blacklist-entry rounded-lg border border-danger/30 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
                      <WarningIcon className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold text-primary-900">{entry.name}</h2>
                      <p className="text-sm font-semibold text-danger">{entry.reason}</p>
                    </div>
                  </div>
                  <div
                    className="blacklist-entry__details rich-text-content whitespace-pre-line text-sm leading-relaxed text-primary-600"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(entry.details) }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
