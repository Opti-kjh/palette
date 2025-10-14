# Design System을 사용한 Figma → React 변환

## 개요
이 프로젝트는 Figma 디자인을 **Design System 컴포넌트를 사용하여** React/Vue 컴포넌트로 변환하는 MCP 서버입니다.

## 핵심 개념

### ❌ 잘못된 방식 (별도 CSS 생성)
```tsx
// 이렇게 하면 안됩니다!
import './ExchangeRateCard.css'; // 별도 CSS 파일
<div className="custom-styles">...</div>
```

### ✅ 올바른 방식 (Design System 사용)
```tsx
// 이렇게 해야 합니다!
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Card } from '@dealicious/design-system-react/src/components/ssm-card';
import { Table } from '@dealicious/design-system-react/src/components/ssm-table';

<Card title="제목" elevation={2}>
  <Button variant="primary">클릭</Button>
</Card>
```

## Design System 컴포넌트 목록

### 🎨 사용 가능한 컴포넌트들

#### Actions
- **Button**: 다양한 variant (primary, secondary, tertiary, danger)
- **Input**: 폼 입력 컴포넌트
- **Modal**: 다이얼로그 컴포넌트

#### Layout  
- **Card**: 콘텐츠 그룹핑용 컨테이너
- **Table**: 데이터 테이블 (정렬, 페이지네이션 지원)

#### Forms
- **Input**: 텍스트 입력 (validation 지원)

#### Data Display
- **Table**: 데이터 테이블 컴포넌트

## 설치 및 설정

### 1. Design System 패키지 설치
```bash
# React Design System
yarn add @dealicious/design-system-react

# Vue Design System  
yarn add @dealicious/design-system
```

### 2. 컴포넌트 사용
```tsx
import { Button, Card, Input, Table } from '@dealicious/design-system-react';

function MyComponent() {
  return (
    <Card title="제목" elevation={2}>
      <Input placeholder="입력하세요" />
      <Button variant="primary">저장</Button>
    </Card>
  );
}
```

## 생성된 컴포넌트 예제

### ExchangeRateCard 컴포넌트
```tsx
// Design System 컴포넌트들을 조합하여 생성
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Card } from '@dealicious/design-system-react/src/components/ssm-card';
import { Table } from '@dealicious/design-system-react/src/components/ssm-table';

const ExchangeRateCard = () => {
  return (
    <Card title="중화권 구독 결제 내역" elevation={2}>
      <div className="filter-section">
        <Button variant="primary">검색</Button>
      </div>
      
      <div className="stats-section">
        <Card elevation={1}>
          <div className="stat-item">총 결제 건수: 1,234</div>
        </Card>
      </div>
      
      <Table 
        data={paymentData}
        columns={columns}
        sortable={true}
        pagination={true}
      />
    </Card>
  );
};
```

## MCP 서버 사용법

### 1. Figma 디자인 분석
```bash
# MCP 서버 시작
yarn dev

# Figma 파일 분석
# convert_figma_to_react 도구 사용
```

### 2. Design System 매핑
- Figma 컴포넌트 → Design System 컴포넌트 자동 매핑
- Button, Input, Card, Table, Modal 등으로 변환
- 별도 CSS 없이 Design System 스타일 사용

## 장점

### 🎯 일관성
- 모든 컴포넌트가 동일한 Design System 사용
- 브랜드 가이드라인 준수

### 🚀 효율성  
- 별도 CSS 작성 불필요
- 기존 Design System 컴포넌트 재사용

### 🔧 유지보수성
- Design System 업데이트 시 자동 반영
- 중앙화된 스타일 관리

## Design System 저장소

- **React**: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system-react
- **Vue**: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system

## 결론

이 프로젝트의 목적은 **별도의 CSS를 생성하는 것이 아니라**, 기존 Design System 컴포넌트들을 활용하여 Figma 디자인을 React/Vue 컴포넌트로 변환하는 것입니다. 

모든 스타일링은 Design System에서 제공되며, 개발자는 비즈니스 로직에만 집중할 수 있습니다.

