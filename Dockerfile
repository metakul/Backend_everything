# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy all application files to the working directory
COPY . .

# Build the application
# RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage and install production dependencies
COPY --from=builder /usr/src/app ./
RUN npm install --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Expose the port application will run on
EXPOSE 8003

# Start the production server with npm run prod
CMD [ "npm", "run", "prod" ]
