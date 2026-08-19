FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs
USER node
ENV PORT=3091
EXPOSE 3091
CMD ["node", "server.mjs"]
