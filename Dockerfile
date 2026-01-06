FROM node:22-slim

# libsecret 설치 (keytar 의존성)
RUN apt-get update && \
    apt-get install -y \
    libsecret-1-0 \
    libsecret-1-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 전체 파일 복사
COPY . .

# 의존성 설치 및 빌드
RUN yarn install --frozen-lockfile && \
    yarn build

# 포트 노출
EXPOSE 3000

# 서버 실행 (HTTP Server)
CMD ["node", "dist/http-server.js"]
