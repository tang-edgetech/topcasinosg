// Must match the API's COOKIE_PREFIX (api/internal/config/config.go), which
// keeps staging and live sessions apart on the shared .topcasinosg.com.sg
// cookie domain.
const COOKIE_PREFIX = process.env.NEXT_PUBLIC_COOKIE_PREFIX ?? "";

export const ACCESS_COOKIE = `${COOKIE_PREFIX}access_token`;
export const HAS_SESSION_COOKIE = `${COOKIE_PREFIX}has_session`;
