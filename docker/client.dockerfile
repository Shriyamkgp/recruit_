# docker/client.dockerfile
FROM node:20-alpine

WORKDIR /client

# copy package files first (cache layer)
COPY client/package*.json ./

# install dependencies (including devDependencies so vite is available)
RUN npm install

# copy application source
COPY client/ .

# expose vite default port
EXPOSE 5173

# run vite and bind to 0.0.0.0 so it's reachable from host
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0"]
