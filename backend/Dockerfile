# Use official Node.js runtime as parent image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY src ./src
COPY migrations ./migrations
COPY .sequelizerc ./

# Expose the port Express app runs on
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
