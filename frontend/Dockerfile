# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV BASE_APP_URL=http://localhost:3000
ENV REACT_APP_API_BASE_URL=http://backend:8000
ENV REACT_APP_GOOGLE_CLIENT_ID=817599786977-sdkrqubmurk5adm9odstvvqqsa9a2956.apps.googleusercontent.com
ENV REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx