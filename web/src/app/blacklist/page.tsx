import type { Metadata } from "next";
import Link from "next/link";
import { getBlacklistEntries, getActiveRegions } from "./_lib/api";
import { sanitizeRichText } from "@/lib/sanitize-html";
import AccordionItem from "@/components/Accordion";

export const metadata: Metadata = {
  title: "Blacklisted Casinos | Top Casino SG",
  description:
    "Casinos flagged for scams, non-payment, or other serious trust and safety issues. Check before you deposit.",
};

const PAGE_SIZE = 25;

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

const WARNING_SIGNS = [
  {
    title: "Unrealistic bonuses and turnover terms",
    body: "Offers that sound too good to be true, or wagering requirements buried in fine print, are a common lure before a payout gets refused.",
  },
  {
    title: "Withheld winnings or delayed payouts",
    body: "A pattern of \"processing\" delays, surprise verification demands, or silence once a withdrawal is requested.",
  },
  {
    title: "No real customer support",
    body: "Contact channels that go unanswered, or support that only responds quickly when you're depositing — not when you're asking about a payout.",
  },
];

const FAQS = [
  {
    q: "What is a blacklisted online casino?",
    a: "An operator we've flagged after a confirmed pattern of scams, refused withdrawals, rigged games, or fake licensing claims — not a single unverified complaint.",
  },
  {
    q: "How do casinos end up on the blacklist?",
    a: "Player reports are cross-checked against license registries, payout history, and terms & conditions before an entry is published.",
  },
  {
    q: "Can a blacklisted casino be removed?",
    a: "Yes, if the operator resolves the underlying issue and we can independently verify the fix — see \"Are Blacklisted Casinos Ever Removed?\" below.",
  },
  {
    q: "How often is the blacklist updated?",
    a: "Entries are reviewed on an ongoing basis as new reports and licensing information come in.",
  },
];

export default async function BlacklistPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const [{ entries, total }, regions] = await Promise.all([
    getBlacklistEntries(page, PAGE_SIZE),
    getActiveRegions(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

          {regions.length > 0 && (
            <div
              id="blacklist-region-links"
              className="blacklist-page__region-links flex flex-wrap items-center gap-2 pt-2"
            >
              <span className="text-sm font-medium text-primary-500">Browse by region:</span>
              {regions
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((region) => (
                  <Link
                    key={region.id}
                    href={`/${region.code}/blacklist`}
                    className="rounded-full border border-primary-200 bg-white px-3 py-1 text-sm font-medium text-primary-700 hover:border-primary-500 hover:text-primary-900"
                  >
                    {region.name}
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>

      <div
        id="blacklist-page-content"
        className="blacklist-page__content mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-10 sm:px-8"
      >
        <section id="blacklist-entries-section" className="flex flex-col gap-6">
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
            <>
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

              {totalPages > 1 && (
                <nav
                  id="blacklist-pagination"
                  aria-label="Blacklist pagination"
                  className="flex items-center justify-between gap-4 pt-2"
                >
                  <Link
                    href={`/blacklist?page=${Math.max(1, page - 1)}`}
                    aria-disabled={page <= 1}
                    className={`rounded-md border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 ${
                      page <= 1 ? "pointer-events-none opacity-40" : "hover:border-primary-500 hover:text-primary-900"
                    }`}
                  >
                    ← Prev
                  </Link>
                  <span className="text-sm text-primary-500">
                    Page {page} of {totalPages}
                  </span>
                  <Link
                    href={`/blacklist?page=${Math.min(totalPages, page + 1)}`}
                    aria-disabled={page >= totalPages}
                    className={`rounded-md border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 ${
                      page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-primary-500 hover:text-primary-900"
                    }`}
                  >
                    Next →
                  </Link>
                </nav>
              )}
            </>
          )}
        </section>

        <section id="blacklist-how-it-works" className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-primary-900">How a Casino Gets on Our Blacklist</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-primary-600">
            <li>We don&apos;t add casinos to a blacklist casually — every entry is fact-checked and backed by trustworthy evidence.</li>
            <li>Received multiple verified complaints from real players.</li>
            <li>Been found withholding payments or refusing to pay legitimate winnings.</li>
            <li>Been linked to fraudulent, misleading, or unfair licensing conduct.</li>
          </ul>
        </section>

        <section id="blacklist-common-reasons" className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-primary-900">Common Reasons for Getting Banned</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-primary-600">
            <li>Refusing to pay out, or delaying payouts indefinitely.</li>
            <li>Rigged or manipulated game outcomes.</li>
            <li>Operating without a valid gambling license.</li>
            <li>Taking away your winnings through unfair or hidden bonus terms.</li>
          </ul>
        </section>

        <section id="blacklist-criteria" className="flex flex-col gap-4 rounded-lg bg-surface-muted p-6">
          <h2 className="text-xl font-bold text-primary-900">Our Blacklist Criteria: How We Investigate</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-primary-900">Complaint Verification &amp; Testing</h3>
              <p className="text-sm leading-relaxed text-primary-600">
                Each report is cross-checked against independent sources before it counts toward a listing — we don&apos;t
                act on a single unverified complaint.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-primary-900">License Validation &amp; Support Testing</h3>
              <p className="text-sm leading-relaxed text-primary-600">
                We confirm whether a casino&apos;s licensing claims actually check out with the issuing regulator, and
                test their support channels directly.
              </p>
            </div>
          </div>
        </section>

        <section id="blacklist-warning-signs" className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-primary-900">Warning Signs of a Scam Casino</h2>
          <div className="flex flex-col gap-4">
            {WARNING_SIGNS.map((sign) => (
              <div key={sign.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
                  <WarningIcon className="h-4 w-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-primary-900">{sign.title}</h3>
                  <p className="text-sm leading-relaxed text-primary-600">{sign.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="blacklist-removal-policy" className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-primary-900">Are Blacklisted Casinos Ever Removed?</h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-primary-900">Re-Evaluation Policy &amp; Timeframes</h3>
            <p className="text-sm leading-relaxed text-primary-600">
              A listing is only removed once the operator has demonstrably fixed the underlying issue and we&apos;ve
              independently confirmed it — this isn&apos;t automatic or time-based.
            </p>
          </div>
        </section>

        <section id="blacklist-trust" className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-primary-900">Why Trust Our Blacklist?</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-primary-900">Independent, Player-Verified Reports</h3>
              <p className="text-sm leading-relaxed text-primary-600">
                Every listing traces back to real player evidence, not a single anonymous claim.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-primary-900">Reviewed on an Ongoing Basis</h3>
              <p className="text-sm leading-relaxed text-primary-600">
                New reports and licensing changes are checked continuously, not on a fixed schedule.
              </p>
            </div>
          </div>
        </section>

        <section id="blacklist-faq" className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-primary-900">Blacklisted Online Casinos FAQs</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <AccordionItem
                key={faq.q}
                className="faq-item rounded-lg border border-primary-100 p-4"
                header={<span className="text-base font-semibold text-primary-900">{faq.q}</span>}
              >
                <p className="pt-3 text-sm leading-relaxed text-primary-600">{faq.a}</p>
              </AccordionItem>
            ))}
          </div>
        </section>

        <section id="blacklist-alternatives" className="flex flex-col items-center gap-4 rounded-lg bg-primary-50 p-8 text-center">
          <h2 className="text-xl font-bold text-primary-900">Play Safe: Trusted Casino Alternatives</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/casinos"
              className="rounded-md bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Explore Trusted Casinos
            </Link>
            <Link
              href="/guides"
              className="rounded-md border border-primary-300 bg-white px-5 py-2.5 text-sm font-semibold text-primary-900 hover:border-primary-500"
            >
              Read Our Casino Guides
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
