# jwt-app — Biblioteca Unipar (front-end)

Front-end em **React 18 + Vite** que consome a API `jwt-api`. Interface com a identidade visual da Unipar (vermelho, preto e a logo).

## Como instalar

```bash
npm install
cp .env.example .env     # no Windows: copy .env.example .env
npm run dev              # abre em http://localhost:5173
```

`.env`:

```
VITE_API_URL=http://localhost:3000/v1
```

A API precisa estar rodando e com `FRONT_URL=http://localhost:5173` no `.env` dela (CORS). Entre com o administrador do seed da API (`admin@biblioteca.com` / `123456`, a menos que você tenha trocado no `.env` da API).

## Telas

Login · Início (cartões do administrador: livros, ativos, atrasados, multas) · Livros (busca, filtros, vários autores, exemplares disponíveis) · Empréstimos (novo, filtro por status, devolução com multa) · Leitores (cadastro e histórico) · Categorias · Autores · Atendentes (somente admin: cadastro e ativar/desativar). Nome do usuário e botão **Sair** no topo.

## Autenticação no front (decisões)

- **Interceptor** (`src/services/api.js`): anexa o `accessToken` em cada requisição. Ao receber **401**, chama `POST /auth/refresh` **uma única vez** e repete a requisição original com o token novo.
- **Fila**: a promessa da renovação fica guardada em `refreshing`. Se várias requisições derem 401 ao mesmo tempo, só sai **uma** chamada de refresh; as demais esperam essa mesma promessa e depois são repetidas.
- **Refresh inválido/expirado**: a sessão local é limpa e o app volta para o login (evento `auth:logout`).
- **Rotas protegidas** (`ProtectedRoute`): sem sessão válida, redireciona para `/login`. Menus de administrador ficam escondidos para atendentes, mas a **API é quem bloqueia de verdade** (403).
- **Onde ficam os tokens**: `localStorage` (`src/services/tokenStorage.js`). Vantagem: a sessão sobrevive ao fechar a aba. **Riscos**: qualquer script injetado (XSS) consegue ler os tokens; por isso o app não usa `dangerouslySetInnerHTML` e o React escapa o conteúdo por padrão. Alternativas: `sessionStorage` (morre ao fechar a aba, mas continua exposto a XSS) ou cookie `httpOnly` para o refresh token (desafio extra; protege de XSS, mas exige atenção com CSRF).

## Para gravar o vídeo

Na API, coloque `ACCESS_TOKEN_TTL=30s` no `.env` e reinicie. Faça login, espere 30 s, clique em qualquer tela e observe na aba **Network** o 401 seguido de `/auth/refresh` e da repetição da chamada. Depois volte para `15m`.
