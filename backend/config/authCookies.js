const ACCESS_TOKEN_COOKIE = 'bc_access_token';
const REFRESH_TOKEN_COOKIE = 'bc_refresh_token';
const ID_TOKEN_COOKIE = 'bc_id_token';
const AUTH_USER_COOKIE = 'bc_auth_user';
const REMEMBER_ME_COOKIE = 'bc_remember_me';

function getCookieOptions({ maxAge, httpOnly = true } = {}) {
  const secure = String(process.env.AUTH_COOKIE_SECURE || process.env.NODE_ENV === 'production' || process.env.VERCEL) === 'true';

  return {
    httpOnly,
    secure,
    sameSite: 'strict',
    path: '/',
    ...(maxAge ? { maxAge } : {})
  };
}

function setAuthCookies(res, tokens, email, rememberMe = false) {
  const accessMaxAge = 15 * 60 * 1000;
  const idMaxAge = 15 * 60 * 1000;
  const refreshMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined;

  if (tokens.AccessToken) {
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.AccessToken, getCookieOptions({ maxAge: accessMaxAge }));
  }

  if (tokens.IdToken) {
    res.cookie(ID_TOKEN_COOKIE, tokens.IdToken, getCookieOptions({ maxAge: idMaxAge }));
  }

  if (tokens.RefreshToken) {
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.RefreshToken, getCookieOptions({ maxAge: refreshMaxAge }));
  }

  res.cookie(AUTH_USER_COOKIE, email.toLowerCase(), getCookieOptions({ maxAge: refreshMaxAge }));
  res.cookie(REMEMBER_ME_COOKIE, rememberMe ? 'true' : 'false', getCookieOptions({ maxAge: refreshMaxAge }));
}

function clearAuthCookies(res) {
  const clearOptions = getCookieOptions();

  [
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    ID_TOKEN_COOKIE,
    AUTH_USER_COOKIE,
    REMEMBER_ME_COOKIE
  ].forEach((cookieName) => {
    res.clearCookie(cookieName, clearOptions);
  });
}

function getAuthCookies(req) {
  return {
    accessToken: req.cookies?.[ACCESS_TOKEN_COOKIE],
    refreshToken: req.cookies?.[REFRESH_TOKEN_COOKIE],
    idToken: req.cookies?.[ID_TOKEN_COOKIE],
    email: req.cookies?.[AUTH_USER_COOKIE],
    rememberMe: req.cookies?.[REMEMBER_ME_COOKIE] === 'true'
  };
}

module.exports = {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ID_TOKEN_COOKIE,
  AUTH_USER_COOKIE,
  REMEMBER_ME_COOKIE,
  setAuthCookies,
  clearAuthCookies,
  getAuthCookies,
  getCookieOptions
};
