# Use the official Node.js image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3200

# Start the Next.js server
CMD ["npm", "run", "start"]