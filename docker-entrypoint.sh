#!/bin/sh
set -eu

PORT_VALUE="${PORT:-80}"
sed -e "s|\${PORT}|${PORT_VALUE}|g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
