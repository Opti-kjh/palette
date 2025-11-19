#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

import { FigmaMCPClient } from './utils/figma-mcp-client.js';

async function main() {
  const client = new FigmaMCPClient();
  
  console.log('Figma Desktop MCP 서버에 연결 중...\n');
  
  try {
    const isAvailable = await client.isAvailable();
    if (!isAvailable) {
      console.error('❌ Figma Desktop MCP 서버를 사용할 수 없습니다.');
      console.log('Figma Desktop 앱이 실행 중이고 MCP 서버가 활성화되어 있는지 확인하세요.');
      process.exit(1);
    }
    
    console.log('✅ Figma Desktop MCP 서버 연결 성공!\n');
    
    console.log('도구 목록 조회 중...');
    
    // 직접 sendRequest를 호출해서 원본 응답 확인
    // @ts-ignore - private 메서드이지만 테스트를 위해 접근
    const rawResult = await (client as any).sendRequest('tools/list');
    console.log('원본 응답:', JSON.stringify(rawResult, null, 2));
    
    const tools = await client.listTools();
    
    console.log(`파싱된 도구 목록:`, JSON.stringify(tools, null, 2));
    
    if (tools.length === 0) {
      console.log('⚠️  사용 가능한 도구가 없습니다.');
      console.log('\n💡 확인 사항:');
      console.log('1. Figma Desktop 앱이 실행 중인지 확인하세요.');
      console.log('2. Figma Desktop 앱의 Preferences에서 "Enable Dev Mode MCP Server"가 활성화되어 있는지 확인하세요.');
      console.log('3. Figma 파일이 열려있는지 확인하세요.');
      return;
    }
    
    console.log(`📋 총 ${tools.length}개의 도구를 찾았습니다:\n`);
    
    tools.forEach((tool: any, index: number) => {
      console.log(`${index + 1}. ${tool.name}`);
      if (tool.description) {
        console.log(`   설명: ${tool.description}`);
      }
      if (tool.inputSchema?.properties) {
        console.log(`   파라미터:`);
        Object.entries(tool.inputSchema.properties).forEach(([key, value]: [string, any]) => {
          console.log(`     - ${key}: ${value.type || 'any'} ${value.description ? `(${value.description})` : ''}`);
        });
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();

