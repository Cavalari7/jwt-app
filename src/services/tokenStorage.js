// Tokens no localStorage: a sessão sobrevive ao fechar a aba.
// Risco: qualquer script injetado (XSS) consegue ler. Veja o README.
const KEY = 'biblioteca.session';

export const tokenStorage = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  },
  save({ accessToken, refreshToken }) {
    localStorage.setItem(KEY, JSON.stringify({ accessToken, refreshToken }));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};
