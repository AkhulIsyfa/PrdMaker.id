# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html ./

# Install dependencies
RUN npm ci

# Copy source
COPY src/ ./src/

# Compile Vue SPA to dist/
RUN npm run build

# Stage 2: Serve with Production Nginx
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
