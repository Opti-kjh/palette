/**
 * HTTP 서버 - Container Runtime용
 *
 * Smithery.ai Container runtime에서 사용됩니다.
 * MCP over HTTP transport를 구현합니다.
 */

import express from 'express';
import cors from 'cors';
import { createPaletteServer } from './server.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const app = express();

// CORS 및 JSON 파싱 미들웨어
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MCP 서버 생성
const mcpServer = createPaletteServer({
  figmaAccessToken: process.env.FIGMA_ACCESS_TOKEN,
  githubToken: process.env.GITHUB_TOKEN,
  figmaMcpServerUrl: process.env.FIGMA_MCP_SERVER_URL,
  useFigmaMcp: false, // Container runtime에서는 Figma REST API만 사용
});

console.error('[HTTP Server] MCP 서버 초기화 완료');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'palette-mcp' });
});

// MCP Server Card - 서버 메타데이터
app.get('/.well-known/mcp-card', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    title: 'Palette MCP',
    description: 'Figma 디자인을 @dealicious/design-system 컴포넌트로 변환하는 MCP 서버. dealicious-inc 조직 멤버만 사용 가능합니다.',
    shortDescription: 'Figma → Design System 컴포넌트 변환',
    iconUrl: 'https://raw.githubusercontent.com/Opti-kjh/palette/main/assets/logo.svg',
    repository: {
      type: 'git',
      url: 'https://github.com/Opti-kjh/palette',
    },
    homepage: 'https://github.com/Opti-kjh/palette',
    author: {
      name: 'KJH',
      email: 'kjh@deali.net',
    },
    license: 'MIT',
    tags: ['figma', 'design-system', 'react', 'vue', 'code-generation'],
  });
});

// MCP Config Schema - 설정 스키마
app.get('/.well-known/mcp-config', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    title: 'MCP Session Configuration',
    description: 'Schema for the /mcp endpoint configuration',
    'x-query-style': 'dot+bracket',
    type: 'object',
    required: ['FIGMA_ACCESS_TOKEN', 'GITHUB_TOKEN'],
    properties: {
      FIGMA_ACCESS_TOKEN: {
        type: 'string',
        description: 'Figma Personal Access Token (필수). Figma 디자인에 접근하기 위해 필요합니다.',
      },
      GITHUB_TOKEN: {
        type: 'string',
        description: 'GitHub Personal Access Token (필수). dealicious-inc 조직 멤버십 확인 및 디자인 시스템 패키지 접근에 필요합니다.',
      },
      FIGMA_MCP_SERVER_URL: {
        type: 'string',
        default: 'http://127.0.0.1:3845/mcp',
        description: 'Figma Dev Mode MCP server URL (선택).',
      },
    },
  });
});

// MCP endpoint - JSON-RPC 2.0 over HTTP
app.post('/mcp', async (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;

    console.error(`[HTTP Server] 요청: ${method}`);

    // JSON-RPC 2.0 검증
    if (jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id || null,
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be "2.0"',
        },
      });
    }

    // MCP 메서드 라우팅
    let result: any;

    switch (method) {
      case 'tools/list': {
        const handler = mcpServer['_requestHandlers'].get(ListToolsRequestSchema);
        if (!handler) throw new Error('tools/list handler not found');
        result = await handler({ method, params: params || {} });
        break;
      }

      case 'tools/call': {
        const handler = mcpServer['_requestHandlers'].get(CallToolRequestSchema);
        if (!handler) throw new Error('tools/call handler not found');
        result = await handler({ method, params });
        break;
      }

      case 'prompts/list': {
        const handler = mcpServer['_requestHandlers'].get(ListPromptsRequestSchema);
        if (!handler) throw new Error('prompts/list handler not found');
        result = await handler({ method, params: params || {} });
        break;
      }

      case 'prompts/get': {
        const handler = mcpServer['_requestHandlers'].get(GetPromptRequestSchema);
        if (!handler) throw new Error('prompts/get handler not found');
        result = await handler({ method, params });
        break;
      }

      case 'resources/list': {
        const handler = mcpServer['_requestHandlers'].get(ListResourcesRequestSchema);
        if (!handler) throw new Error('resources/list handler not found');
        result = await handler({ method, params: params || {} });
        break;
      }

      case 'resources/read': {
        const handler = mcpServer['_requestHandlers'].get(ReadResourceRequestSchema);
        if (!handler) throw new Error('resources/read handler not found');
        result = await handler({ method, params });
        break;
      }

      case 'initialize': {
        // 초기화 응답
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            prompts: {},
            resources: {},
          },
          serverInfo: {
            name: 'palette',
            version: '1.3.3',
          },
        };
        break;
      }

      case 'ping': {
        result = {};
        break;
      }

      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    console.error(`[HTTP Server] 응답 성공: ${method}`);

    res.json({
      jsonrpc: '2.0',
      id,
      result,
    });
  } catch (error: any) {
    console.error('[HTTP Server] 오류:', error);
    res.status(200).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: error.code || -32603,
        message: error instanceof Error ? error.message : 'Internal error',
        data: error.data,
      },
    });
  }
});

// 서버 시작
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.error(`[HTTP Server] Palette MCP HTTP 서버 시작: http://localhost:${port}`);
  console.error(`[HTTP Server] Health check: http://localhost:${port}/health`);
  console.error(`[HTTP Server] MCP endpoint: http://localhost:${port}/mcp`);
  console.error(`[HTTP Server] 환경변수:`);
  console.error(`  - FIGMA_ACCESS_TOKEN: ${process.env.FIGMA_ACCESS_TOKEN ? '설정됨' : '미설정'}`);
  console.error(`  - GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '설정됨' : '미설정'}`);
});
