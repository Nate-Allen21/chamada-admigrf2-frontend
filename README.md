# ADMIG RF II — Frontend

Interface React/Vite do sistema de chamada da Escola Dominical ADMIG RF II.

## Executar

```bash
npm install
npm run dev
```

Configure `VITE_API_URL` em `.env` quando a API não estiver disponível em `/api`.

## Deploy na Vercel

Importe o repositório GitHub na Vercel e configure a Root Directory para a pasta
do frontend (caso o repositório contenha apenas o frontend, deixe `./`). A Vercel
detecta Vite automaticamente. O comando de build é `npm run build` e a pasta de
saída é `dist`.

Configure estas variáveis em Project Settings > Environment Variables, para cada
ambiente em que fará deploy:

```text
VITE_API_URL=https://SUA-API.onrender.com/api
VITE_API_BASE=https://SUA-API.onrender.com
```

`VITE_API_URL` é a URL chamada pelas requisições REST. `VITE_API_BASE` é usada
para carregar URLs de fotos servidas pelo backend. São valores públicos incluídos
no bundle do frontend; não coloque senhas ou tokens nelas. Após alterá-las, faça
um novo deploy. O `vercel.json` já envia rotas React para `index.html`.

Não configure `PORT` ou `VITE_API_BASE` como segredos. O serviço frontend no
Render só é necessário se optar por publicar o container Docker existente em vez
da Vercel; não mantenha ambos sem necessidade.

## Desenvolvimento local com Vite

```text
VITE_API_URL=http://localhost:8080/api
VITE_API_BASE=http://localhost:8080
```

