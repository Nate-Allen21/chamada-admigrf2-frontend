# ADMIG RF II — Frontend

Interface React/Vite do sistema de chamada da Escola Dominical ADMIG RF II.

## Executar

```bash
npm install
npm run dev
```

Configure `VITE_API_URL` em `.env` quando a API não estiver disponível em `/api`.

## Deploy na Vercel

Defina a raiz do projeto como `frontend` e configure, nas variáveis de ambiente
da Vercel:

```text
VITE_API_URL=https://seu-backend.onrender.com/api
VITE_API_BASE=https://seu-backend.onrender.com
```

O `vercel.json` mantém as rotas do React funcionando após atualizar a página.

