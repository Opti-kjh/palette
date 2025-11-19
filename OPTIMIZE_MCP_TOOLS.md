# MCP 도구 최적화 가이드

## 현재 상황
- **총 활성화된 도구**: 234개
- **GitHub MCP**: 200개 도구
- **경고**: 너무 많은 도구는 성능 저하를 일으킬 수 있으며, 일부 모델은 80개 이상의 도구를 제대로 처리하지 못할 수 있음

## 해결 방법

### 방법 1: 사용하지 않는 MCP 서버 비활성화 (권장)

현재 비활성화된 서버들:
- ✅ taskmaster-ai (비활성화됨)
- ✅ context7-mcp (비활성화됨)
- ✅ Automated UI Debuger and Tester (비활성화됨)
- ✅ ScrapeGraph MCP Server (비활성화됨)
- ✅ Memory Tool (비활성화됨)

**추가로 비활성화할 수 있는 서버:**
- **Sequential Thinking**: "Needs authentication" 상태 - 사용하지 않으면 비활성화
- **MCP Installer**: 3개 도구 - 설치 후 필요 없으면 비활성화 가능

### 방법 2: GitHub MCP 도구 선택적 사용

GitHub MCP는 200개의 도구를 제공하지만, 실제로 필요한 도구만 사용할 수 있습니다:

1. **자주 사용하는 GitHub 작업 확인**
   - 저장소 관리
   - 이슈/PR 관리
   - 코드 검토
   - 등등

2. **GitHub MCP 서버 임시 비활성화**
   - 필요할 때만 활성화
   - 대부분의 작업에서 필요하지 않다면 비활성화

### 방법 3: 도구 수 목표 설정

**권장 도구 수**: 80개 이하
- 일부 모델의 제한
- 성능 최적화

**현재 활성화된 서버:**
- GitHub: 200개
- desktop-commander: 25개
- Figma Desktop: 6개
- MCP Installer: 3개
- **총합**: 234개

**목표 달성을 위한 옵션:**
1. GitHub MCP 비활성화 → 34개 (목표 달성)
2. GitHub + desktop-commander 비활성화 → 9개
3. GitHub만 비활성화하고 필요할 때만 활성화

## 권장 설정

### 시나리오 1: GitHub 작업이 자주 필요한 경우
- GitHub MCP: 활성화 (200개)
- desktop-commander: 활성화 (25개)
- Figma Desktop: 활성화 (6개)
- 나머지: 비활성화
- **총합**: 231개 (성능 저하 가능)

### 시나리오 2: GitHub 작업이 가끔 필요한 경우 (권장)
- GitHub MCP: 필요할 때만 활성화
- desktop-commander: 활성화 (25개)
- Figma Desktop: 활성화 (6개)
- MCP Installer: 비활성화 (설치 완료 후)
- **총합**: 31개 (최적)

### 시나리오 3: 최소 설정
- desktop-commander: 활성화 (25개)
- Figma Desktop: 활성화 (6개)
- 나머지: 모두 비활성화
- **총합**: 31개 (최적)

## 실행 방법

### MCP 서버 비활성화
1. Cursor 설정 → MCP
2. 각 서버의 토글 스위치를 OFF로 변경
3. Cursor 재시작 (선택사항)

### GitHub MCP 임시 비활성화
- GitHub 작업이 필요할 때만 활성화
- 작업 완료 후 다시 비활성화

## 참고

- **도구 이름 길이 문제**: 일부 GitHub 도구 이름이 60자 이상이라 필터링될 수 있음
- **성능**: 도구 수가 많을수록 응답 시간이 느려질 수 있음
- **모델 제한**: 일부 모델은 80개 이상의 도구를 제대로 처리하지 못함

## 결론

**권장**: GitHub MCP를 필요할 때만 활성화하는 방식으로 사용
- 평소에는 비활성화 (31개 도구)
- GitHub 작업 필요 시 활성화
- 작업 완료 후 비활성화

이렇게 하면 성능을 최적화하면서도 필요할 때 GitHub 기능을 사용할 수 있습니다.

