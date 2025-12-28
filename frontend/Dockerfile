FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Clear any stale SvelteKit cache
RUN rm -rf .svelte-kit

EXPOSE 5173

# Sync SvelteKit types before starting dev server
CMD ["sh", "-c", "npx svelte-kit sync && npm run dev -- --host"]
