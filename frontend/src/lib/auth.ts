import Cookies from 'js-cookie';

const TOKEN_KEY = 'admin_token';

export const auth = {
  getToken: () => Cookies.get(TOKEN_KEY) ?? null,
  setToken: (token: string, expiresInSeconds = 86400) =>
    Cookies.set(TOKEN_KEY, token, {
      expires: expiresInSeconds / 86400,
      sameSite: 'strict',
    }),
  removeToken: () => Cookies.remove(TOKEN_KEY),
  isAuthenticated: () => !!Cookies.get(TOKEN_KEY),
};
