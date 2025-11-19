#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * HTTP 타입 MCP 서버 테스트
 */
async function testHttpMCPServer(name: string, url: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 ${name} MCP 서버 테스트`);
  console.log(`URL: ${url}`);
  console.log('='.repeat(60));
  
  try {
    const client = axios.create({
      baseURL: url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // JSON-RPC 2.0 요청 생성
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {},
    };

    console.log('\n📤 요청 전송 중...');
    const response = await client.post('', request);
    
    console.log('✅ 연결 성공!');
    console.log('\n📥 응답 상태:', response.status);
    console.log('📥 응답 데이터:', JSON.stringify(response.data, null, 2));
    
    if (response.data.error) {
      console.error('❌ MCP 에러:', response.data.error);
      return false;
    }

    const tools = response.data.result?.tools || [];
    console.log(`\n📋 도구 개수: ${tools.length}`);
    
    if (tools.length > 0) {
      console.log('\n📝 도구 목록:');
      tools.forEach((tool: any, index: number) => {
        console.log(`\n${index + 1}. ${tool.name}`);
        if (tool.description) {
          console.log(`   설명: ${tool.description}`);
        }
        if (tool.inputSchema?.properties) {
          console.log(`   파라미터:`);
          Object.entries(tool.inputSchema.properties).forEach(([key, value]: [string, any]) => {
            console.log(`     - ${key}: ${value.type || 'any'}`);
          });
        }
      });
      return true;
    } else {
      console.log('⚠️  도구가 없습니다.');
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ 연결 거부됨 - 서버가 실행 중이지 않습니다.');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('❌ 타임아웃 - 서버가 응답하지 않습니다.');
      } else if (error.response) {
        console.error(`❌ HTTP 에러: ${error.response.status} ${error.response.statusText}`);
        console.error('응답 데이터:', error.response.data);
      } else {
        console.error('❌ 연결 에러:', error.message);
      }
    } else {
      console.error('❌ 예상치 못한 에러:', error);
    }
    return false;
  }
}

/**
 * stdio 타입 MCP 서버는 직접 테스트하기 어려우므로 정보만 출력
 */
function testStdioMCPServer(name: string, config: any) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`ℹ️  ${name} MCP 서버 정보`);
  console.log('='.repeat(60));
  console.log('타입: stdio');
  console.log('명령:', config.command);
  console.log('인자:', config.args?.join(' ') || '없음');
  console.log('\n💡 stdio 타입 MCP 서버는 Cursor가 직접 관리합니다.');
  console.log('   "Loading tools" 상태가 지속되면:');
  console.log('   1. Cursor를 재시작해보세요');
  console.log('   2. MCP 서버 설정을 확인하세요');
  console.log('   3. 환경 변수가 올바르게 설정되었는지 확인하세요');
  if (config.env) {
    console.log('\n환경 변수:');
    Object.keys(config.env).forEach(key => {
      if (key.includes('TOKEN') || key.includes('KEY') || key.includes('SECRET')) {
        console.log(`   ${key}: *** (보안상 숨김)`);
      } else {
        console.log(`   ${key}: ${config.env[key]}`);
      }
    });
  }
}

async function main() {
  console.log('🚀 MCP 서버 연결 테스트 시작\n');

  // mcp.json 파일 읽기
  const mcpConfigPath = join(process.env.HOME || '', '.cursor', 'mcp.json');
  let mcpConfig: any = {};
  
  try {
    const fs = await import('fs/promises');
    const configContent = await fs.readFile(mcpConfigPath, 'utf-8');
    mcpConfig = JSON.parse(configContent);
    console.log(`✅ mcp.json 파일 로드 성공: ${mcpConfigPath}\n`);
  } catch (error) {
    console.error(`❌ mcp.json 파일을 읽을 수 없습니다: ${mcpConfigPath}`);
    console.error('에러:', error);
    process.exit(1);
  }

  if (!mcpConfig.mcpServers) {
    console.error('❌ mcpServers 설정을 찾을 수 없습니다.');
    process.exit(1);
  }

  const servers = mcpConfig.mcpServers;
  const httpServers: Array<{ name: string; url: string }> = [];
  const stdioServers: Array<{ name: string; config: any }> = [];

  // 서버 분류
  Object.entries(servers).forEach(([name, config]: [string, any]) => {
    if (config.type === 'http' || config.url) {
      httpServers.push({ name, url: config.url });
    } else if (config.type === 'stdio' || config.command) {
      stdioServers.push({ name, config });
    }
  });

  // HTTP 타입 서버 테스트
  if (httpServers.length > 0) {
    console.log(`\n📡 HTTP 타입 MCP 서버 (${httpServers.length}개):`);
    for (const server of httpServers) {
      await testHttpMCPServer(server.name, server.url);
    }
  }

  // stdio 타입 서버 정보 출력
  if (stdioServers.length > 0) {
    console.log(`\n\n📡 stdio 타입 MCP 서버 (${stdioServers.length}개):`);
    for (const server of stdioServers) {
      testStdioMCPServer(server.name, server.config);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ 테스트 완료');
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('❌ 치명적 오류:', error);
  process.exit(1);
});

