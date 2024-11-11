FROM --platform=linux/amd64 node:20-alpine AS builder

ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID

ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the built files
FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 4173
RUN npm install -g vite
CMD ["npx", "vite", "preview", "--host", "0.0.0.0"]
