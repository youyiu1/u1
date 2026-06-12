#!/bin/sh
set -eu

CERT_PATH="${NGINX_SSL_CERT_PATH:-/etc/nginx/certs/tls.crt}"
KEY_PATH="${NGINX_SSL_KEY_PATH:-/etc/nginx/certs/tls.key}"
COMMON_NAME="${NGINX_SSL_CN:-localhost}"

if [ -s "$CERT_PATH" ] && [ -s "$KEY_PATH" ]; then
  exit 0
fi

mkdir -p "$(dirname "$CERT_PATH")" "$(dirname "$KEY_PATH")"

openssl req \
  -x509 \
  -nodes \
  -newkey rsa:2048 \
  -days 3650 \
  -keyout "$KEY_PATH" \
  -out "$CERT_PATH" \
  -subj "/CN=$COMMON_NAME"
