FROM node:22-slim

# libsecret 설치 (keytar 의존성)
RUN apt-get update && \
    apt-get install -y \
    libsecret-1-0 \
    libsecret-1-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 패키지 파일 복사
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* .yarnrc* ./

# 의존성 설치
RUN if [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    elif [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    else \
      npm install; \
    fi

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN yarn build

# 서버 실행 (HTTP Server)
CMD ["node", "dist/http-server.js"]
