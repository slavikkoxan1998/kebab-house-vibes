FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN NITRO_PRESET=node-server npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV PORT=8792
ENV HOST=0.0.0.0
EXPOSE 8792
CMD ["node", ".output/server/index.mjs"]
