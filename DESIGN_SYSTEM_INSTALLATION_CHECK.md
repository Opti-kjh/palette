# 디자인 시스템 설치 상태 진단 리포트

## 📋 설치 상태 요약

### ✅ 설치 확인됨
- `node_modules/@dealicious/design-system` 디렉토리 존재
- `node_modules/@dealicious/design-system-react` 디렉토리 존재
- `yarn why` 명령어로 패키지 의존성 확인됨

### ❌ 문제점 발견

1. **실제 컴포넌트 파일이 없음**
   - `node_modules/@dealicious/design-system-react/src/components/` 경로가 존재하지 않음
   - `ssm-button`, `ssm-text` 등의 컴포넌트 디렉토리를 찾을 수 없음

2. **Monorepo 구조 문제**
   - 전체 monorepo 루트(`@dealicious/ssm-web`)가 설치됨
   - `packages/design-system-react`와 `packages/design-system` 디렉토리가 없음
   - Yarn workspaces가 제대로 처리되지 않은 것으로 보임

3. **Import 경로 실패**
   - `@dealicious/design-system-react/src/components/ssm-button` 경로가 작동하지 않음
   - `require.resolve()` 테스트 실패

## 🔍 상세 분석

### 설치된 패키지 정보
```json
{
  "name": "@dealicious/ssm-web",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### 현재 package.json 설정
```json
{
  "dependencies": {
    "@dealicious/design-system": "https://github.com/dealicious-inc/ssm-web.git#master",
    "@dealicious/design-system-react": "https://github.com/dealicious-inc/ssm-web.git#master"
  }
}
```

## 🚨 문제 원인

1. **Monorepo 구조 미지원**
   - `package.json`에서 monorepo 루트를 직접 참조하고 있음
   - Yarn이 workspaces를 자동으로 처리하지 못함
   - 실제 패키지 경로(`packages/design-system-react`)가 설치되지 않음

2. **패키지 경로 불일치**
   - 코드에서 기대하는 경로: `@dealicious/design-system-react/src/components/ssm-button`
   - 실제 설치된 경로: `@dealicious/design-system-react/` (monorepo 루트만)

## ✅ 해결 방법

### 방법 1: 올바른 패키지 경로로 재설치 (권장)

`package.json`을 다음과 같이 수정:

```json
{
  "dependencies": {
    "@dealicious/design-system": "https://github.com/dealicious-inc/ssm-web.git#master:packages/design-system",
    "@dealicious/design-system-react": "https://github.com/dealicious-inc/ssm-web.git#master:packages/design-system-react"
  }
}
```

그 다음:
```bash
rm -rf node_modules/@dealicious
yarn install
```

### 방법 2: Git Subdirectory 설치

```bash
yarn add @dealicious/design-system@https://github.com/dealicious-inc/ssm-web.git#master:packages/design-system
yarn add @dealicious/design-system-react@https://github.com/dealicious-inc/ssm-web.git#master:packages/design-system-react
```

### 방법 3: 실제 패키지 구조 확인 후 경로 수정

저장소의 실제 구조를 확인하고 올바른 import 경로를 사용:

```bash
# 저장소 클론하여 구조 확인
git clone https://github.com/dealicious-inc/ssm-web.git /tmp/ssm-web-check
ls -la /tmp/ssm-web-check/packages/
```

## 📝 권장 조치사항

1. **즉시 조치**
   - `package.json`의 패키지 경로를 `:packages/design-system-react` 형식으로 수정
   - `yarn install` 재실행

2. **검증**
   - 설치 후 다음 경로 확인:
     ```bash
     ls -la node_modules/@dealicious/design-system-react/src/components/
     ```

3. **Import 테스트**
   ```typescript
   import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
   ```

## 🔗 참고 자료

- Yarn Git Subdirectory: https://yarnpkg.com/features/protocols#git
- Monorepo 패키지 설치: https://yarnpkg.com/features/workspaces

