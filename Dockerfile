# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --quiet
COPY frontend ./
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --quiet
COPY backend ./
RUN npm run build

# Stage 3: Final Production Image
FROM node:18-alpine
WORKDIR /app

# Copy built artifacts
COPY --from=frontend-builder /app/frontend /app/frontend
COPY --from=backend-builder /app/backend /app/backend
COPY package*.json ./

# Install only production dependencies for the root
RUN npm install --only=production --quiet

EXPOSE 3000
EXPOSE 8000

CMD ["npx", "concurrently", "\"npm run start:prod --prefix backend\"", "\"npm run start --prefix frontend\""]
