export type Role = "super_admin" | "admin" | "editor";
export type UserStatus = "active" | "disabled" | "deleted";
export type ThemePreference = "light" | "dark";
export type Language = "en" | "cn";

export interface AdminUserDTO {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  canManageAdmins: boolean;
  themePreference: ThemePreference;
  status: UserStatus;
  otpEnrolled: boolean;
  createdAt: string;
}

export type LoginStatus = "ok" | "otp_required" | "otp_setup_required";

export interface LoginResponse {
  status: LoginStatus;
  user?: AdminUserDTO;
  ephemeralToken?: string;
}

export interface OTPSetupResponse {
  secret: string;
  otpauthUrl: string;
}

export interface SiteSettingsDTO {
  siteUrl: string;
  siteTitle: string;
  seoIndex: boolean;
  seoFollow: boolean;
  timezone: string;
  language: Language;
  logoUrl: string | null;
  faviconUrl: string | null;
  twoFactorEnabled: boolean;
}

export type MediaKind = "image" | "document" | "audio" | "video";

export interface MediaDTO {
  id: number;
  originalFilename: string;
  title: string;
  altText: string;
  description: string;
  mimeType: string;
  kind: MediaKind;
  fileSize: number;
  url: string;
  createdAt: string;
}

export type ContentStatus = "draft" | "scheduled" | "published";

export interface RegionDTO {
  id: number;
  code: string;
  name: string;
  flagMediaId: number | null;
  flagUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface GameProviderDTO {
  id: number;
  name: string;
  logoMediaId: number | null;
  logoUrl: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface LicenseDTO {
  id: number;
  name: string;
  logoMediaId: number | null;
  logoUrl: string | null;
  sortOrder: number;
  createdAt: string;
}

export type RiskStatus = "low" | "medium" | "high";

// Fixed taxonomy, mirrors api/internal/domain/casino.go's GameType/AllGameTypes.
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

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  slots: "Slots",
  blackjack: "Blackjack",
  baccarat: "Baccarat",
  roulette: "Roulette",
  sic_bo: "Sic Bo",
  craps: "Craps",
  poker: "Poker",
  video_poker: "Video Poker",
  bingo: "Bingo",
};

export interface CasinoDTO {
  id: number;
  slug: string;
  name: string;
  logoMediaId: number | null;
  rating: number;
  summary: string;
  content: string;
  languages: string[] | null;
  paymentMethods: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  safeIndex: number | null;
  riskStatus: RiskStatus | null;
  supportedGames: GameType[] | null;
  payoutSpeed: string;
  ctaUrl: string;
  status: ContentStatus;
  publishAt: string | null;
  regionIds: number[] | null;
  gameProviderIds: number[] | null;
  licenseIds: number[] | null;
  createdAt: string;
  updatedAt: string;
}

export type BonusType = "welcome" | "no_deposit" | "free_spins" | "cashback" | "loyalty_vip" | "deposit";

export interface BonusDTO {
  id: number;
  regionId: number;
  casinoId: number | null;
  bonusType: BonusType;
  title: string;
  terms: string;
  code: string | null;
  validFrom: string | null;
  validUntil: string | null;
  status: ContentStatus;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodDTO {
  id: number;
  regionId: number;
  name: string;
  description: string;
  iconMediaId: number | null;
  status: ContentStatus;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RTPCategory = "slot" | "table" | "live" | "other";

export interface RTPEntryDTO {
  id: number;
  regionId: number;
  casinoId: number | null;
  gameName: string;
  category: RTPCategory;
  rtpPercentage: number;
  status: ContentStatus;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuideDTO {
  id: number;
  regionId: number | null;
  title: string;
  slug: string;
  coverMediaId: number | null;
  excerpt: string;
  content: string;
  status: ContentStatus;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlacklistEntryDTO {
  id: number;
  regionId: number | null;
  name: string;
  reason: string;
  details: string;
  status: ContentStatus;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MenuLocation = "header" | "footer";
export type MenuItemSourceType = "static" | "dynamic_regions" | "dynamic_casinos";

export interface MenuItemDTO {
  id: number;
  location: MenuLocation;
  parentId: number | null;
  label: string;
  href: string | null;
  sourceType: MenuItemSourceType;
  sortOrder: number;
}

export interface NewsArticleDTO {
  id: number;
  title: string;
  slug: string;
  coverMediaId: number | null;
  excerpt: string;
  content: string;
  status: ContentStatus;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageDTO {
  id: number;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  headSnippet: string;
  bodySnippet: string;
  footerSnippet: string;
  status: ContentStatus;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SnippetLocation = "head" | "body" | "footer";
export type SnippetKind = "global" | "code";
export type CodeType = "html" | "css" | "js" | "universal";
export type ConditionField = "page" | "url";
export type ConditionOperator = "is" | "is_not" | "contains" | "not_contains";

export interface SnippetConditionDTO {
  id: number;
  field: ConditionField;
  operator: ConditionOperator;
  pageId: number | null;
  value: string;
  sortOrder: number;
}

export interface SnippetDTO {
  id: number;
  name: string;
  kind: SnippetKind;
  codeType: CodeType | null;
  location: SnippetLocation;
  content: string;
  isActive: boolean;
  sortOrder: number;
  priority: number;
  conditions: SnippetConditionDTO[];
  createdAt: string;
  updatedAt: string;
}

export type PageFieldType = "text" | "richtext" | "image" | "button";

export interface PageSectionFieldDTO {
  itemIndex: number;
  fieldKey: string;
  fieldType: PageFieldType;
  textValue: string;
  mediaId: number | null;
  mediaUrl: string | null;
  urlValue: string;
  sortOrder: number;
}

export type PageBlockType =
  | "hero"
  | "rich_text"
  | "icon_box_group"
  | "image_gallery"
  | "cta"
  | "logo_strip"
  | "stats_counter"
  | "faq"
  | "bonus_calculator";

export interface PageSectionDTO {
  id: number;
  blockType: PageBlockType;
  customClass: string;
  customId: string;
  sortOrder: number;
  fields: PageSectionFieldDTO[];
}
