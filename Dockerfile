# Use Node.js as the base image (for building the frontend)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend (React, Next.js, etc.)
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# Expose the port (default for Nginx is 80)
EXPOSE 80
