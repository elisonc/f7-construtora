# Imagem de produção da F7 Engenharia Estratégica.
# O banco e os arquivos enviados ficam em /data (monte um disco persistente nessa pasta).
FROM node:24-slim

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production \
    F7_DADOS=/data \
    PORT=10000 \
    CONFIAR_PROXY=1

EXPOSE 10000
CMD ["node", "--disable-warning=ExperimentalWarning", "server.js", "--prod"]
