FROM m.daocloud.io/docker.io/library/node:22-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./

ARG GEMINI_API_KEY=""
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

RUN npm run build

FROM m.daocloud.io/docker.io/library/nginx:1.27-alpine

COPY deploy/nginx-docker.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
