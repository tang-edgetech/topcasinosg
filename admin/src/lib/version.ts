export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
export const APP_COMMIT = process.env.NEXT_PUBLIC_APP_COMMIT ?? "";
export const APP_BUILD_DATE = process.env.NEXT_PUBLIC_APP_BUILD_DATE ?? "";

export const isDevVersion = (version: string) => version === "dev" || version.endsWith("-dev");
