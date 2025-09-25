# Base image
FROM node:20-alpine
WORKDIR /server

# Set environment to production
ENV NODE_ENV=production

# Copy package files and install dependencies
COPY server/package*.json ./
RUN npm install

# Copy the rest of the application files
COPY server ./

# Expose port (inside container)
EXPOSE 5000

# Run the app
CMD ["npm", "run", "dev"]