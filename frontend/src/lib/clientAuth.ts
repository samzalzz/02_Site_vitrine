import Cookies from 'js-cookie';

const TOKEN_KEY = 'client_auth_token';

export const clientAuth = {
  setToken(token: string, expiresInSeconds = 86400): void {
    if (typeof window !== 'undefined') {
      Cookies.set(TOKEN_KEY, token, {
        expires: expiresInSeconds / 86400,
        sameSite: 'strict',
      });
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get(TOKEN_KEY) ?? null;
    }
    return null;
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove(TOKEN_KEY);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
