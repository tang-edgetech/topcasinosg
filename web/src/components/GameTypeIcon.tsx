import type { GameType } from "@/lib/gameTypes";

const PATHS: Record<GameType, React.ReactNode> = {
  slots: (
    <>
      <rect x="3" y="4" width="15" height="16" rx="2" />
      <path d="M6 9h3v5H6zM10.5 9h3v5h-3zM15 9h0M18 8l2-2v8" />
      <path d="M7 17h7" />
    </>
  ),
  roulette: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" />
    </>
  ),
  blackjack: (
    <>
      <rect x="3" y="6" width="11" height="15" rx="1.5" transform="rotate(-10 8.5 13.5)" />
      <rect x="10" y="3" width="11" height="15" rx="1.5" transform="rotate(8 15.5 10.5)" />
      <path d="M15 8.5l1.5 2-1.5 2-1.5-2z" />
    </>
  ),
  baccarat: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M12 7l3 5-3 5-3-5z" />
    </>
  ),
  sic_bo: (
    <>
      <rect x="2.5" y="10" width="9" height="9" rx="1.5" />
      <rect x="12.5" y="10" width="9" height="9" rx="1.5" />
      <rect x="7.5" y="2.5" width="9" height="9" rx="1.5" />
      <path d="M12 7h0M5.5 13h0M8.5 16h0M17 14.5h0" strokeWidth="2.4" />
    </>
  ),
  craps: (
    <>
      <rect x="2.5" y="8" width="10" height="10" rx="2" transform="rotate(-12 7.5 13)" />
      <rect x="11.5" y="5" width="10" height="10" rx="2" transform="rotate(10 16.5 10)" />
      <path d="M6 11h0M9 15h0M16.5 10h0" strokeWidth="2.4" />
    </>
  ),
  poker: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </>
  ),
  video_poker: (
    <>
      <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
      <path d="M8 21h8M12 16.5V21" />
      <rect x="9" y="6.5" width="6" height="7" rx="1" />
    </>
  ),
  bingo: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
  pai_gow: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M7 12h10" />
      <path d="M12 7h0M10 15.5h0M14 15.5h0M12 18h0" strokeWidth="2.4" />
    </>
  ),
  keno: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 8v8M9 12l4-4M10.5 11l3 5" />
    </>
  ),
};

export default function GameTypeIcon({ type, className = "h-8 w-8" }: { type: GameType; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[type]}
    </svg>
  );
}
