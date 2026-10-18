# ADMIG RF II — Frontend

Interface React/Vite do sistema de chamada da Escola Dominical ADMIG RF II.

## Executar

```bash
npm install
npm run dev
```

Configure `VITE_API_URL` em `.env` quando a API não estiver disponível em `/api`.

## Deploy no Render

Este frontend foi preparado para rodar em um serviço web do Render usando Docker.

Configure as variáveis de ambiente do serviço Render:

```text
PORT=10000
VITE_API_URL=https://seu-backend.onrender.com/api
VITE_API_BASE=https://seu-backend.onrender.com
```

O Render vai servir o app em sua porta dinâmica e o nginx vai responder ao `PORT` automaticamente.
O frontend usa a URL pública do backend, então não depende de um container interno para chamar a API.

