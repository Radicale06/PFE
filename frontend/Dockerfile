# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY . .

# Install dependencies
RUN npm Install

# Set environment variables for build
ENV REACT_APP_API_BASE_URL=http://backend:8000
ENV REACT_APP_GOOGLE_CLIENT_ID=817599786977-sdkrqubmurk5adm9odstvvqqsa9a2956.apps.googleusercontent.com
ENV REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

CMD [ "npm", "run", "deploy" ]