# Base image
FROM node:20-alpine

# Install useful tools
RUN apk add --no-cache curl

# Set working directory
WORKDIR /server

# Copy package files and install dependencies
COPY server/package*.json ./
RUN npm install
RUN npm install -g tsx

# Copy the rest of the application files
COPY server ./

# Create uploads directory
RUN mkdir -p public/uploads/resumes

# Expose port (inside container)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Run the app
CMD ["npm", "run", "dev"]