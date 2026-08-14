// Fixed taxonomy, mirrors api/internal/domain/casino.go's GameType/AllGameTypes.
// Single shared source for web/ — previously duplicated verbatim in both
// casinos/lib.ts and [region]/_lib/api.ts.
export type GameType =
  | "slots"
  | "blackjack"
  | "baccarat"
  | "roulette"
  | "sic_bo"
  | "craps"
  | "poker"
  | "video_poker"
  | "bingo";

export const ALL_GAME_TYPES: { value: GameType; label: string }[] = [
  { value: "slots", label: "Slots" },
  { value: "blackjack", label: "Blackjack" },
  { value: "baccarat", label: "Baccarat" },
  { value: "roulette", label: "Roulette" },
  { value: "sic_bo", label: "Sic Bo" },
  { value: "craps", label: "Craps" },
  { value: "poker", label: "Poker" },
  { value: "video_poker", label: "Video Poker" },
  { value: "bingo", label: "Bingo" },
];
