/**
 * HTTP 서버 - Container Runtime용
 *
 * Smithery.ai Container runtime에서 사용됩니다.
 * stdio MCP 서버를 HTTP transport로 감쌉니다.
 */

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS 및 JSON 파싱 미들웨어
app.use(cors());
app.use(express.json());

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

// MCP endpoint - stdio를 HTTP로 프록시
app.post('/mcp', async (req, res) => {
  try {
    const request = req.body;

    // stdio MCP 서버 실행
    const child = spawn('node', [join(__dirname, 'index.js')], {
      env: {
        ...process.env,
        FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        FIGMA_MCP_SERVER_URL: process.env.FIGMA_MCP_SERVER_URL,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let responseData = '';
    let errorData = '';

    child.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error('[MCP stderr]:', data.toString());
    });

    // 요청 전송
    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('[MCP] Process exited with code:', code);
        return res.status(500).json({
          jsonrpc: '2.0',
          id: request.id || null,
          error: {
            code: -32603,
            message: `Process exited with code ${code}: ${errorData}`,
          },
        });
      }

      try {
        const response = JSON.parse(responseData);
        res.json(response);
      } catch (parseError) {
        console.error('[MCP] Parse error:', parseError);
        res.status(500).json({
          jsonrpc: '2.0',
          id: request.id || null,
          error: {
            code: -32700,
            message: 'Parse error: Invalid JSON response',
          },
        });
      }
    });

    child.on('error', (error) => {
      console.error('[MCP] Process error:', error);
      res.status(500).json({
        jsonrpc: '2.0',
        id: request.id || null,
        error: {
          code: -32603,
          message: error.message,
        },
      });
    });
  } catch (error) {
    console.error('[HTTP Server] 오류:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
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
});
