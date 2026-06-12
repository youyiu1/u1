FROM m.daocloud.io/docker.io/library/node:22-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./

RUN npm run build

FROM m.daocloud.io/docker.io/library/nginx:1.27-alpine

RUN apk add --no-cache openssl

ENV PUBLIC_HOST=localhost
ENV BACKEND_PROXY_URL=http://host.docker.internal:18081
ENV NGINX_SSL_CERT_PATH=/etc/nginx/certs/tls.crt
ENV NGINX_SSL_KEY_PATH=/etc/nginx/certs/tls.key
ENV NGINX_SSL_CN=localhost
ENV NGINX_ENVSUBST_FILTER=PUBLIC_HOST|BACKEND_PROXY_URL|NGINX_SSL_CERT_PATH|NGINX_SSL_KEY_PATH

COPY deploy/nginx-docker.conf /etc/nginx/templates/default.conf.template
COPY frontend/docker-entrypoint.d/40-generate-self-signed-cert.sh /docker-entrypoint.d/40-generate-self-signed-cert.sh
RUN chmod +x /docker-entrypoint.d/40-generate-self-signed-cert.sh
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
