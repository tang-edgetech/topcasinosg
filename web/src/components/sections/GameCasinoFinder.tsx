"use client";

import { useState } from "react";
import Link from "next/link";
import GameTypeIcon from "@/components/GameTypeIcon";
import type { GameType } from "@/lib/gameTypes";

export interface FinderCasino {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  score: number;
  ctaUrl: string;
  games: string[];
}

// Figma's tile order (Poker isn't one of the design's options).
const FINDER_GAMES: { value: GameType; label: string }[] = [
  { value: "slots", label: "Slots" },
  { value: "roulette", label: "Roulette" },
  { value: "blackjack", label: "Blackjack" },
  { value: "baccarat", label: "Baccarat" },
  { value: "sic_bo", label: "Sic Bo" },
  { value: "pai_gow", label: "Pai Gow" },
  { value: "keno", label: "Keno" },
  { value: "craps", label: "Craps" },
  { value: "bingo", label: "Bingo" },
  { value: "video_poker", label: "Video Poker" },
];

export default function GameCasinoFinder({
  casinos,
  panelTitle,
  panelSubtitle,
  results,
}: {
  casinos: FinderCasino[];
  panelTitle: string;
  panelSubtitle: string;
  results: number;
}) {
  const [selected, setSelected] = useState<GameType | null>(null);
  const selectedLabel = FINDER_GAMES.find((g) => g.value === selected)?.label ?? "";
  const matches = selected ? casinos.filter((c) => c.games.includes(selected)).slice(0, results) : [];

  return (
    <div className="game-finder mx-auto flex w-full max-w-[960px] flex-col overflow-hidden rounded-lg bg-surface-muted">
      <div className="flex flex-col items-center gap-1 border-b border-primary-100 px-4 py-5 text-center">
        <h3 className="text-base font-bold text-primary-900">{panelTitle}</h3>
        <p className="text-xs text-primary-500">{panelSubtitle}</p>
      </div>

      <div className="flex flex-col items-center gap-6 px-4 py-6">
        <div role="radiogroup" aria-label={panelTitle} className="flex max-w-[560px] flex-wrap justify-center gap-2">
          {FINDER_GAMES.map((game) => {
            const active = selected === game.value;
            return (
              <button
                key={game.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(active ? null : game.value)}
                className={`flex w-[72px] cursor-pointer flex-col items-center gap-1.5 rounded-md border px-2 py-2.5 text-xs transition-colors sm:w-[80px] ${
                  active
                    ? "border-primary-900 bg-primary-900 text-white"
                    : "border-primary-100 bg-white text-primary-600 hover:border-primary-400 hover:text-primary-900"
                }`}
              >
                <GameTypeIcon type={game.value} className={`h-7 w-7 ${active ? "text-white" : "text-primary-glow"}`} />
                {game.label}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="w-full max-w-[560px]" aria-live="polite">
            {matches.length === 0 ? (
              <p className="rounded-md bg-white px-4 py-5 text-center text-sm text-primary-600">
                No casinos with {selectedLabel} are listed for this region yet.
              </p>
            ) : (
              <ol className="flex flex-col gap-2">
                {matches.map((casino, i) => (
                  <li key={casino.id} className="flex items-center gap-3 rounded-md bg-white px-3 py-2.5">
                    <span className="w-4 text-sm font-semibold text-primary-500">{i + 1}</span>
                    {casino.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={casino.logo} alt="" className="h-8 w-14 object-contain" />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="h-8 w-14 rounded bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]"
                      />
                    )}
                    <Link href={`/casinos/${casino.slug}`} className="flex-1 cursor-pointer text-sm font-semibold text-primary-900 hover:text-secondary-700">
                      {casino.name}
                    </Link>
                    <span className="text-sm text-primary-900">
                      <span className="font-bold">{casino.score.toFixed(1)}</span>
                      <span className="text-xs">/10</span>
                    </span>
                    <Link
                      href={casino.ctaUrl}
                      rel="noopener noreferrer sponsored"
                      className="cursor-pointer rounded-md bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800"
                    >
                      Visit Site
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
