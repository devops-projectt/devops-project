# Multi-stage build for MoodCast application
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --cache /tmp/.npm
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache tini

# Copy frontend build
COPY --from=frontend-builder /app/dist ./dist

# Copy server source
COPY server ./server

# Copy root files needed for data import
COPY package*.json ./
COPY importFromListenNotes.js ./

# Install only root production dependencies (for data import script)
RUN npm ci --only=production --cache /tmp/.npm

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 5173

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the backend server
CMD ["node", "server/index.js"]