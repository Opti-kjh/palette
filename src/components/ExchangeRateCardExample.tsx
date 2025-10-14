import React from 'react';
import ExchangeRateCard from './ExchangeRateCard';

/**
 * ExchangeRateCard 컴포넌트 사용 예제
 * Design System 컴포넌트를 사용하여 생성된 컴포넌트
 */
const ExchangeRateCardExample: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f3f4f6', 
      padding: '20px' 
    }}>
      <ExchangeRateCard />
    </div>
  );
};

export default ExchangeRateCardExample;

