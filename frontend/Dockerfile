FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Clear stale caches and reinstall on every start to avoid hydration issues
CMD ["sh", "-c", "rm -rf .svelte-kit node_modules/.vite && npx svelte-kit sync && npm run dev -- --host"]
