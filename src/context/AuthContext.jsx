import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { tokenStorage } from '../services/tokenStorage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao abrir o app, valida a sessão guardada (o interceptor renova se o access expirou)
  useEffect(() => {
    if (!tokenStorage.get().accessToken) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  // O interceptor dispara este evento quando o refresh falha
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStorage.save(data);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const { refreshToken } = tokenStorage.get();
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      /* se a API estiver fora, encerramos a sessão local mesmo assim */
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
