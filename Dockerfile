# Simple single-stage Dockerfile for Railway
FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy all source files
COPY . .

# Build the application (run next build directly to see errors)
RUN npx next build

# Verify build completed
RUN echo "Build complete. Contents of .next:" && ls -la .next && echo "BUILD_ID:" && cat .next/BUILD_ID

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "start"]
