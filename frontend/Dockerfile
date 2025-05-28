# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment variables for build
ENV REACT_APP_API_BASE_URL=http://localhost:8000
ENV REACT_APP_GOOGLE_CLIENT_ID=817599786977-sdkrqubmurk5adm9odstvvqqsa9a2956.apps.googleusercontent.com
ENV REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
ENV BASE_APP_URL=http://localhost

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]