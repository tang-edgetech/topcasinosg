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
