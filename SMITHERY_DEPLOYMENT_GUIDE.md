# Smithery.ai 배포 가이드

## 핵심 원칙

Palette MCP는 Smithery.ai에 배포되며, 다음 원칙을 따릅니다:

### 1. Runtime 선택

| Runtime | 사용 시점 | 특징 |
|---------|----------|------|
| `typescript` | 단순한 MCP 서버, 네이티브 의존성 없음 | Smithery가 자동 빌드 |
| `container` | 네이티브 의존성 필요 (libsecret 등) | 커스텀 Dockerfile 사용 |

**Palette는 `container` runtime 사용** - `keytar`/`libsecret` 의존성 때문

### 2. Transport 타입 ⚠️ 중요!

| Transport | 사용 환경 | smithery.yaml 설정 |
|-----------|----------|-------------------|
| `stdio` | 로컬 개발만 | `type: "stdio"` |
| `http` | Smithery 호스팅 (필수) | `type: "http"` + `url` |

**중요**: Container runtime은 **반드시 HTTP transport 사용**

```yaml
# ❌ 잘못된 예 - Container에서 stdio 사용
runtime: "container"
startCommand:
  type: "stdio"  # ← 에러 발생!

# ✅ 올바른 예 - Container에서 HTTP 사용
runtime: "container"
startCommand:
  type: "http"
  url: "http://localhost:3000"
```

### 3. smithery.yaml 구조

#### Container Runtime (현재 사용 중)

```yaml
runtime: "container"

startCommand:
  type: "http"
  url: "http://localhost:3000"
  configSchema:
    type: "object"
    required:
      - "FIGMA_ACCESS_TOKEN"
      - "GITHUB_TOKEN"
    properties:
      FIGMA_ACCESS_TOKEN:
        type: "string"
        format: "password"
        description: "Figma Personal Access Token"
      GITHUB_TOKEN:
        type: "string"
        format: "password"
        description: "GitHub Token for organization auth"
```

#### TypeScript Runtime (참고용 - 현재 미사용)

```yaml
runtime: "typescript"

# configSchema는 src/smithery.ts의 zod 스키마에서 자동 생성
```

### 4. Dockerfile 요구사항

Container runtime 사용 시 Dockerfile에 다음 포함:

```dockerfile
FROM node:22-slim

# 1. 네이티브 의존성 설치 (keytar 때문)
RUN apt-get update && apt-get install -y \
    libsecret-1-0 \
    libsecret-1-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. 의존성 및 빌드
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# 3. Smithery CLI로 빌드
RUN npx -y @smithery/cli build -o .smithery/index.cjs

# 4. HTTP 서버로 실행
EXPOSE 3000
CMD ["node", ".smithery/index.cjs"]
```

### 5. 환경변수 필수 항목

| 변수 | 필수 | 용도 |
|------|------|------|
| `FIGMA_ACCESS_TOKEN` | ✅ | Figma API 접근 |
| `GITHUB_TOKEN` | ✅ | dealicious-inc 조직 인증 + 디자인 시스템 접근 |
| `FIGMA_MCP_SERVER_URL` | ❌ | 로컬 개발용 (기본값: http://127.0.0.1:3845/mcp) |

### 6. 일반적인 배포 오류 및 해결

| 오류 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| `stdio transport is only supported for local deployments` | Container runtime에서 stdio 사용 | smithery.yaml에서 `type: "http"` 사용 |
| `libsecret-1.so.0: cannot open shared object file` | Dockerfile에서 libsecret 미설치 | Dockerfile에 libsecret 설치 추가 |
| `Your lockfile needs to be updated` | yarn.lock이 package.json과 동기화 안됨 | `yarn install` 실행 후 커밋 |
| `Failed to validate smithery.yaml` | smithery.yaml 스키마 오류 | 위의 올바른 형식 참고 |
| `You cannot publish over previously published versions` | 동일 버전 재배포 시도 | package.json 버전 증가 |

### 7. 배포 체크리스트

배포 전 다음 항목을 확인:

- [ ] `yarn.lock`이 최신 상태인가? (`yarn install` 실행)
- [ ] `yarn build`가 성공하는가?
- [ ] `smithery.yaml`의 `runtime: "container"`인가?
- [ ] `smithery.yaml`의 `type: "http"`인가? (stdio ❌)
- [ ] `Dockerfile`이 HTTP 서버로 실행되는가?
- [ ] 환경변수 `required`에 필수 항목이 표시되어 있는가?
- [ ] `package.json` 버전이 증가했는가? (npm 배포 시)

### 8. 배포 프로세스

```bash
# 1. 로컬 빌드 확인
yarn build

# 2. lockfile 동기화 (필요시)
yarn install

# 3. 버전 증가 (npm 배포 시)
# package.json의 version 증가

# 4. 커밋 & 푸시
git add -A
git commit -m "fix: smithery deployment configuration"
git push origin main

# 5. Smithery 배포
# https://smithery.ai/server/@Opti-kjh/palette/deployments
# Deploy 버튼 클릭

# 6. npm 배포 (필요시)
npm publish --access public
```

### 9. 문제 해결 프로세스

배포 실패 시:

1. **오류 로그 확인**: Smithery 배포 페이지에서 전체 로그 확인
2. **로컬 테스트**: `yarn build` 로컬 실행 확인
3. **Dockerfile 테스트**: `docker build -t palette-test .` 로컬 Docker 빌드
4. **smithery.yaml 검증**: 위의 올바른 형식과 비교
5. **yarn.lock 동기화**: `yarn install` 후 재배포

### 10. 참고 문서

- Smithery Container Runtime: https://smithery.ai/docs/build/container
- Smithery HTTP Transport: https://smithery.ai/docs/build/transports#http
- MCP SDK: https://github.com/modelcontextprotocol/sdk
- Smithery CLI: https://www.npmjs.com/package/@smithery/cli

---

## 현재 설정 요약

- **Runtime**: `container` (네이티브 의존성 때문)
- **Transport**: `http` (필수)
- **Port**: 3000
- **필수 환경변수**: FIGMA_ACCESS_TOKEN, GITHUB_TOKEN
