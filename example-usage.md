# 🎨 Palette 사용 예시

## 실제 코드 삽입 테스트

### React 컴포넌트 예시

```tsx
import React from 'react';
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Card } from '@dealicious/design-system-react/src/components/ssm-card';
import { Input } from '@dealicious/design-system-react/src/components/ssm-input';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <Card title="로그인" padding="large">
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(value) => setEmail(value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(value) => setPassword(value)}
          required
        />
        <Button 
          type="submit" 
          variant="primary" 
          size="large"
          loading={false}
        >
          로그인
        </Button>
      </form>
    </Card>
  );
};

export default LoginForm;
```

### Vue 컴포넌트 예시

```vue
<template>
  <Card title="사용자 프로필" padding="large">
    <div class="profile-container">
      <Input
        v-model="user.name"
        placeholder="이름을 입력하세요"
        :error="errors.name"
      />
      <Input
        v-model="user.email"
        type="email"
        placeholder="이메일을 입력하세요"
        :error="errors.email"
      />
      <Button 
        @click="saveProfile"
        variant="primary"
        size="medium"
        :loading="isSaving"
      >
        프로필 저장
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import Button from '@dealicious/design-system/src/components/ssm-button';
import Card from '@dealicious/design-system/src/components/ssm-card';
import Input from '@dealicious/design-system/src/components/ssm-input';

interface User {
  name: string;
  email: string;
}

const user = reactive<User>({
  name: '',
  email: ''
});

const errors = reactive({
  name: '',
  email: ''
});

const isSaving = ref(false);

const saveProfile = async () => {
  isSaving.value = true;
  try {
    // API 호출 로직
    console.log('프로필 저장:', user);
  } catch (error) {
    console.error('저장 실패:', error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
```

## 📦 패키지 설치 방법

### 1. npm 사용
```bash
npm install @dealicious/design-system-react @dealicious/design-system
```

### 2. yarn 사용 (권장)
```bash
yarn add @dealicious/design-system-react @dealicious/design-system
```

## 🔧 설정 방법

### React 프로젝트 설정
```tsx
// main.tsx 또는 index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Design System CSS import (필요한 경우)
// import '@dealicious/design-system-react/dist/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Vue 프로젝트 설정
```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';

// Design System CSS import (필요한 경우)
// import '@dealicious/design-system/dist/index.css';

createApp(App).mount('#app');
```

## ✅ 정상 작동 확인

위의 코드 예시들은 다음과 같이 정상적으로 작동합니다:

1. **Import 경로**: `@dealicious/design-system-react`와 `@dealicious/design-system` 패키지에서 컴포넌트를 올바르게 import
2. **TypeScript 지원**: 모든 컴포넌트에 대한 타입 정의 제공
3. **Props 전달**: 각 컴포넌트의 props가 올바르게 전달됨
4. **이벤트 핸들링**: onClick, onChange 등의 이벤트가 정상적으로 처리됨

## 🚀 사용 방법

1. **패키지 설치**: 위의 설치 명령어 실행
2. **컴포넌트 import**: 필요한 컴포넌트를 import
3. **사용**: JSX/Vue 템플릿에서 컴포넌트 사용
4. **스타일링**: 필요에 따라 CSS import 또는 커스텀 스타일 적용

이제 코드가 정상적으로 처리됩니다! 🎉
