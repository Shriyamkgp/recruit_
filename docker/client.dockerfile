# Dockerfile
FROM node:20-alpine AS build
WORKDIR /client

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy source files and build
COPY client ./
RUN npm run build

# Normalize build output to /client/out
RUN if [ -d /client/dist ]; then \
    rm -rf /client/out && cp -r /client/dist /client/out; \
    elif [ -d /client/build ]; then \
    rm -rf /client/out && cp -r /client/build /client/out; \
    else \
    echo "ERROR: build produced no 'dist' or 'build' directory. Contents of /client:" && ls -la /client && exit 1; \
    fi

# Final stage: nginx
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /client/out .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]