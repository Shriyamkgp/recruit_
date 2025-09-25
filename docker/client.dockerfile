# Use a Node.js base image
FROM node:20-alpine
WORKDIR /client

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm install

# The CMD will run the development server
CMD ["npm", "start"]