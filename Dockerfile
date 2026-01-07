FROM node:20-slim

# Install system dependencies required for keytar and build tools
# libsecret-1-dev is required for building keytar
# libsecret-1-0 is required for running keytar
# python3, make, g++, pkg-config are required for node-gyp build
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libsecret-1-dev \
    libsecret-1-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN yarn build

# Start command
CMD ["node", "dist/index.js"]
