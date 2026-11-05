import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';
const api = axios.create({ baseURL });

// 1) Anexa o access token em toda requisição
api.interceptors.request.use((config) => {
  const { accessToken } = tokenStorage.get();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// 2) Em 401: renova UMA vez e repete a requisição original.
// `refreshing` guarda a promessa da renovação em andamento: todas as outras
// requisições que falharem enquanto isso esperam essa mesma promessa (a "fila").
let refreshing = null;

function renewSession() {
  if (!refreshing) {
    const { refreshToken } = tokenStorage.get();
    refreshing = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        tokenStorage.save(data);
        return data.accessToken;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

const isAuthRoute = (url = '') => url.includes('/auth/login') || url.includes('/auth/refresh');

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (!response || response.status !== 401 || config._retry || isAuthRoute(config.url)) {
      return Promise.reject(error);
    }
    config._retry = true;
    try {
      const accessToken = await renewSession();
      config.headers.Authorization = `Bearer ${accessToken}`;
      return api(config);
    } catch (refreshError) {
      // Refresh inválido ou expirado: limpa a sessão e avisa o app (volta ao login)
      tokenStorage.clear();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    }
  }
);

export const errorMessage = (err, fallback = 'Algo deu errado. Tente novamente.') =>
  err?.response?.data?.message || (err?.code === 'ERR_NETWORK' ? 'Não foi possível conectar à API. Verifique se ela está rodando.' : fallback);

export default api;
