FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Note: prisma schema is mounted via docker-compose volume
# Prisma generate will run at startup via npm run dev

EXPOSE 3001

CMD ["npm", "run", "dev"]
