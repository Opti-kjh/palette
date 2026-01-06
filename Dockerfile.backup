FROM node:22-slim

# libsecret 설치 (keytar 의존성)
RUN apt-get update && apt-get install -y \
    libsecret-1-0 \
    libsecret-1-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 패키지 파일 복사
COPY package.json yarn.lock ./

# 의존성 설치
RUN yarn install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 빌드
RUN yarn build

# 환경변수 기본값
ENV PORT=3000
ENV NODE_ENV=production

# HTTP 서버로 실행
EXPOSE 3000
CMD ["node", "dist/http-server.js"]
