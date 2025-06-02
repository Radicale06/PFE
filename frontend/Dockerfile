# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY . .

# Set environment variables for build
ENV REACT_APP_API_BASE_URL=http://217.182.211.152:8000
ENV REACT_APP_GOOGLE_CLIENT_ID=817599786977-sdkrqubmurk5adm9odstvvqqsa9a2956.apps.googleusercontent.com
ENV REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Install dependencies
RUN npm ci
RUN npm run build
RUN npm install -g serve
CMD [ "serve", "-s","build" ]