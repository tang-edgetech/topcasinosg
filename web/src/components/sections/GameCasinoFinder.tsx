"use client";

import { useState } from "react";
import Link from "next/link";
import GameTypeIcon from "@/components/GameTypeIcon";
import CasinoLogo from "@/components/CasinoLogo";
import VisitSiteLink from "@/components/VisitSiteLink";
import { DISPLAY_GAME_TYPES, type GameType } from "@/lib/gameTypes";

export interface FinderCasino {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  score: number;
  ctaUrl: string;
  games: string[];
}


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
  const selectedLabel = DISPLAY_GAME_TYPES.find((g) => g.value === selected)?.label ?? "";
  const matches = selected ? casinos.filter((c) => c.games.includes(selected)).slice(0, results) : [];

  return (
    <div className="game-finder mx-auto flex w-full max-w-[960px] flex-col overflow-hidden rounded-lg bg-surface-muted">
      <div className="flex flex-col items-center gap-1 border-b border-primary-100 px-4 py-5 text-center">
        <h3 className="text-base font-bold text-primary-900">{panelTitle}</h3>
        <p className="text-xs text-primary-500">{panelSubtitle}</p>
      </div>

      <div className="flex flex-col items-center gap-6 px-4 py-6">
        <div role="radiogroup" aria-label={panelTitle} className="flex max-w-[560px] flex-wrap justify-center gap-2">
          {DISPLAY_GAME_TYPES.map((game) => {
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
                    <CasinoLogo src={casino.logo} name={casino.name} className="h-8 w-14" />
                    <Link href={`/casinos/${casino.slug}`} className="flex-1 cursor-pointer text-sm font-semibold text-primary-900 hover:text-secondary-700">
                      {casino.name}
                    </Link>
                    <span className="text-sm text-primary-900">
                      <span className="font-bold">{casino.score.toFixed(1)}</span>
                      <span className="text-xs">/10</span>
                    </span>
                    <VisitSiteLink
                      href={casino.ctaUrl}
                      fallbackHref={`/casinos/${casino.slug}`}
                      className="cursor-pointer rounded-md bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800"
                    />
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
