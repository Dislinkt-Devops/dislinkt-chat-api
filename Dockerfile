# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
# RUN npm install
RUN npm ci -f --only=production

# Bundle app source
# COPY . .
COPY dist .

# Creates a "dist" folder with the production build
# RUN npm run build

# Expose port
EXPOSE 3000

# Start the server using the production build
CMD [ "node", "main.js" ]