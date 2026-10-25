# Etapa 1: compila la SPA.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: tests. Hereda Node, dependencias y el código del build.
FROM build AS test
ENTRYPOINT ["npm", "run", "test:ci"]

# Etapa 3: nginx sirve únicamente los archivos estáticos finales.
FROM nginx:1.27-alpine AS final
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV BACKEND_URL=http://backend:8080 \
    DNS_RESOLVER=127.0.0.11
EXPOSE 80
