import Cookies from 'js-cookie';

type MatchingCookies = {
  [key: string]: string;
};

export const cookieManager = {
  set: (key: string, value: string, options?: Cookies.CookieAttributes) => {
    Cookies.set(key, value, options);
  },
  get: (key: string) => {
    return Cookies.get(key);
  },
  remove: (key: string) => {
    Cookies.remove(key);
  },
  getCookieName: (keys: (string | undefined)[]) => {
    return keys.filter(Boolean).join('-');
  },
  getAll: () => {
    return Cookies.get();
  },
  getAllMatching: (pattern: RegExp): MatchingCookies => {
    const allCookies = Cookies.get();
    const matchingCookies: MatchingCookies = {};

    Object.keys(allCookies).forEach((key) => {
      if (pattern.test(key)) {
        matchingCookies[key] = allCookies[key];
      }
    });

    return matchingCookies;
  },
};
