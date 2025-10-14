// Design System Components from GitHub:
// React: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system-react
// Vue: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system
// 
// To use these components, install the packages:
// npm install @dealicious/design-system-react @dealicious/design-system
// or
// yarn add @dealicious/design-system-react @dealicious/design-system

import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Input } from '@dealicious/design-system-react/src/components/ssm-input';
import { Card } from '@dealicious/design-system-react/src/components/ssm-card';
import { Table } from '@dealicious/design-system-react/src/components/ssm-table';
import React from 'react';

interface ExchangeRateCardProps {
  // Add your props here
}

const ExchangeRateCard: React.FC<ExchangeRateCardProps> = (props) => {
  return (
    <div className="exchange-rate-card-1989">
      <Card title="중화권 구독 결제 내역" elevation={2} padding="large">
        <div className="header-section">
          <div className="date-range">
            <span className="date-label">조회 기간</span>
            <span className="date-value">2024.01.01 - 2024.12.31</span>
          </div>
        </div>
        
        <div className="filter-section">
          <div className="filter-group">
            <label>결제 상태</label>
            <select>
              <option value="all">전체</option>
              <option value="success">성공</option>
              <option value="failed">실패</option>
              <option value="pending">대기중</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>결제 수단</label>
            <select>
              <option value="all">전체</option>
              <option value="card">카드</option>
              <option value="bank">계좌이체</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>검색</label>
            <Input placeholder="주문번호 또는 이메일 검색" />
          </div>
          
          <Button variant="primary">검색</Button>
        </div>
        
        <div className="stats-section">
          <Card elevation={1} padding="medium">
            <div className="stat-item">
              <div className="stat-label">총 결제 건수</div>
              <div className="stat-value">1,234</div>
            </div>
          </Card>
          
          <Card elevation={1} padding="medium">
            <div className="stat-item">
              <div className="stat-label">성공 건수</div>
              <div className="stat-value success">1,200</div>
            </div>
          </Card>
          
          <Card elevation={1} padding="medium">
            <div className="stat-item">
              <div className="stat-label">실패 건수</div>
              <div className="stat-value error">34</div>
            </div>
          </Card>
          
          <Card elevation={1} padding="medium">
            <div className="stat-item">
              <div className="stat-label">총 결제 금액</div>
              <div className="stat-value">₩12,345,678</div>
            </div>
          </Card>
        </div>
        
        <div className="table-section">
          <div className="table-header">
            <h3>결제 내역</h3>
            <div className="table-actions">
              <Button variant="secondary">Excel 다운로드</Button>
              <Button variant="secondary">새로고침</Button>
            </div>
          </div>
          
          <Table 
            data={[
              {
                orderNumber: 'ORD-2024-001',
                paymentDate: '2024.01.15 14:30',
                paymentMethod: '신용카드',
                status: '성공',
                amount: 'USD 99.00',
                exchangeRate: '1,350원',
                krwAmount: '₩133,650',
                customer: 'user@example.com'
              },
              {
                orderNumber: 'ORD-2024-002',
                paymentDate: '2024.01.16 09:15',
                paymentMethod: 'PayPal',
                status: '성공',
                amount: 'USD 99.00',
                exchangeRate: '1,355원',
                krwAmount: '₩134,145',
                customer: 'customer@test.com'
              },
              {
                orderNumber: 'ORD-2024-003',
                paymentDate: '2024.01.17 16:45',
                paymentMethod: '계좌이체',
                status: '실패',
                amount: 'USD 99.00',
                exchangeRate: '1,348원',
                krwAmount: '₩133,452',
                customer: 'user2@domain.com'
              }
            ]}
            columns={[
              { key: 'orderNumber', title: '주문번호' },
              { key: 'paymentDate', title: '결제일시' },
              { key: 'paymentMethod', title: '결제수단' },
              { key: 'status', title: '결제상태' },
              { key: 'amount', title: '결제금액' },
              { key: 'exchangeRate', title: '환율' },
              { key: 'krwAmount', title: '원화금액' },
              { key: 'customer', title: '고객정보' }
            ]}
            sortable={true}
            pagination={true}
          />
        </div>
      </Card>
    </div>
  );
};

export default ExchangeRateCard;

