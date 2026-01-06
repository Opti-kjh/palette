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
