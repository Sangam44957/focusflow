# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]