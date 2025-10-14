# Palette 프로젝트 구동 로직 다이어그램

## 1. 전체 시스템 아키텍처

```mermaid
graph TB
    subgraph "Palette MCP Server"
        A[MCP Protocol Layer]
        B[Service Layer]
        C[External APIs]
    end
    
    subgraph "MCP Protocol Layer"
        D[List Tools Handler]
        E[Call Tool Handler]
        F[Error Handler]
    end
    
    subgraph "Service Layer"
        G[FigmaService]
        H[DesignSystemService]
        I[CodeGenerator]
    end
    
    subgraph "External APIs"
        J[Figma API]
        K[Design System Components]
        L[GitHub Repository]
    end
    
    A --> D
    A --> E
    A --> F
    B --> G
    B --> H
    B --> I
    C --> J
    C --> K
    C --> L
    
    G --> J
    H --> K
    I --> L
```

## 2. 주요 도구(Tools) 흐름도

```mermaid
graph TD
    A[사용자 요청] --> B{도구 선택}
    
    B --> C[convert_figma_to_react]
    B --> D[convert_figma_to_vue]
    B --> E[list_design_system_components]
    B --> F[analyze_figma_file]
    
    C --> G[FigmaService.getFigmaData]
    D --> G
    F --> G
    
    G --> H[DesignSystemService.findBestMatch]
    H --> I[CodeGenerator.generateComponent]
    I --> J[React/Vue 코드 반환]
    
    E --> K[사용 가능한 컴포넌트 목록 반환]
```

## 3. Figma → React/Vue 변환 과정

```mermaid
graph TD
    A[Figma Design] --> B[FigmaService]
    
    subgraph "FigmaService 처리 과정"
        B1[URL에서 File ID 추출]
        B2[Figma API 호출]
        B3[파일 데이터 파싱]
        B4[노드 구조 분석]
        B5[컴포넌트 정보 추출]
    end
    
    B --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    
    B5 --> C[DesignSystemService]
    
    subgraph "DesignSystemService 처리 과정"
        C1[사용 가능한 컴포넌트 목록 관리]
        C2[Figma 노드와 Design System 매핑]
        C3[최적 컴포넌트 선택]
    end
    
    C --> C1
    C1 --> C2
    C2 --> C3
    
    C3 --> D[CodeGenerator]
    
    subgraph "CodeGenerator 처리 과정"
        D1[컴포넌트 구조 생성]
        D2[Props 매핑]
        D3[Import 문 생성]
        D4[최종 코드 반환]
    end
    
    D --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D4
```

## 4. 컴포넌트 매핑 로직

```mermaid
graph TD
    A[Figma Node] --> B[Node Analysis]
    
    subgraph "Node Analysis"
        B1[Node Type: TEXT, FRAME, RECTANGLE, COMPONENT]
        B2[Node Name: 버튼, 입력, 카드 등]
        B3[Node Properties: 크기, 색상, 스타일]
    end
    
    B --> B1
    B --> B2
    B --> B3
    
    B1 --> C[Component Matching Logic]
    B2 --> C
    B3 --> C
    
    subgraph "Component Matching Logic"
        C1[직접 이름 매칭]
        C2[패턴 기반 매칭]
        C3[타입 기반 매칭]
        C4[기본값 매칭]
    end
    
    C --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    
    C1 --> D[Button 컴포넌트]
    C2 --> E[Input 컴포넌트]
    C3 --> F[Card 컴포넌트]
    C4 --> G[기본 Card 컴포넌트]
```

## 5. 생성되는 코드 구조

```mermaid
graph TD
    A[코드 생성 시작] --> B[Import 문 생성]
    
    B --> C[Design System 패키지 Import]
    C --> D[React/Vue 기본 Import]
    
    D --> E[컴포넌트 구조 생성]
    
    subgraph "컴포넌트 구조"
        E1[Interface/Props 정의]
        E2[컴포넌트 함수 생성]
        E3[JSX/Template 생성]
        E4[Export 문 생성]
    end
    
    E --> E1
    E1 --> E2
    E2 --> E3
    E3 --> E4
    
    E4 --> F[최종 코드 반환]
```

## 6. 환경 설정 및 실행

```mermaid
graph TD
    A[프로젝트 시작] --> B[환경 변수 설정]
    
    B --> C[FIGMA_ACCESS_TOKEN 설정]
    C --> D[의존성 설치]
    
    D --> E[yarn install]
    E --> F[빌드]
    
    F --> G[yarn build]
    G --> H[MCP 서버 실행]
    
    H --> I[yarn mcp - 프로덕션]
    H --> J[yarn mcp:dev - 개발]
    
    I --> K[Cursor에서 MCP 서버 연결]
    J --> K
    
    K --> L[mcp-config.json 설정]
    L --> M[stdio 통신으로 연결]
```

## 7. 서비스 간 상호작용

```mermaid
sequenceDiagram
    participant U as 사용자
    participant M as MCP Server
    participant F as FigmaService
    participant D as DesignSystemService
    participant C as CodeGenerator
    
    U->>M: convert_figma_to_react 요청
    M->>F: getFigmaData(figmaUrl, nodeId)
    F->>F: Figma API 호출
    F-->>M: FigmaFile 데이터
    
    M->>D: findBestMatch(figmaComponent, 'react')
    D->>D: 컴포넌트 매핑 로직 실행
    D-->>M: DesignSystemComponent
    
    M->>C: generateReactComponent(figmaData, componentName)
    C->>C: 컴포넌트 구조 생성
    C->>C: Props 매핑
    C->>C: Import 문 생성
    C-->>M: React 코드
    
    M-->>U: 생성된 React 컴포넌트 코드
```

## 8. 에러 처리 흐름

```mermaid
graph TD
    A[요청 처리 시작] --> B{에러 발생?}
    
    B -->|No| C[정상 처리]
    B -->|Yes| D[에러 타입 확인]
    
    D --> E[Figma API 에러]
    D --> F[Design System 에러]
    D --> G[코드 생성 에러]
    D --> H[기타 에러]
    
    E --> I[Figma 토큰 확인]
    F --> J[컴포넌트 매핑 실패]
    G --> K[코드 생성 실패]
    H --> L[알 수 없는 에러]
    
    I --> M[에러 메시지 반환]
    J --> M
    K --> M
    L --> M
    
    C --> N[성공 응답 반환]
    M --> O[에러 응답 반환]
```

이 Mermaid 다이어그램들은 Palette 프로젝트의 전체적인 구동 로직을 시각적으로 보여줍니다. 각 다이어그램은 시스템의 다른 측면을 다루며, 프로젝트의 구조와 동작 방식을 명확하게 이해할 수 있도록 도와줍니다.
