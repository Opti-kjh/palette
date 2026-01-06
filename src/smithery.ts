/**
 * Palette MCP Server - Smithery Remote 배포용
 *
 * Smithery.ai에서 호스팅될 때 사용됩니다.
 * @smithery/sdk를 사용하여 HTTP 서버로 실행됩니다.
 */

import { createStatelessServer } from '@smithery/sdk/server/stateless.js';
import { z } from 'zod';
import { createPaletteServer } from './server.js';

/**
 * Smithery 설정 스키마 정의
 *
 * Palette MCP Server Configuration
 * Figma 디자인을 Design System 컴포넌트로 변환하기 위한 설정
 */
export const configSchema = z.object({
  // Figma Access Token - Figma API 호출에 필수
  FIGMA_ACCESS_TOKEN: z
    .string()
    .min(1)
    .describe('Figma Personal Access Token (필수). Figma 디자인에 접근하기 위해 필요합니다. https://www.figma.com/developers/api#access-tokens 에서 발급'),

  // GitHub Token - 조직 인증 및 디자인 시스템 패키지 접근에 필수
  GITHUB_TOKEN: z
    .string()
    .min(1)
    .describe('GitHub Personal Access Token (필수). dealicious-inc 조직 멤버십 확인 및 디자인 시스템 패키지 접근에 필요합니다.'),

  // Figma MCP Server URL - 로컬 개발용 (Remote 모드에서는 사용 안함)
  FIGMA_MCP_SERVER_URL: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .default('http://127.0.0.1:3845/mcp')
    .describe('Figma Dev Mode MCP server URL (선택). 로컬 개발 시 Figma Desktop 앱과 연동할 때만 필요합니다.'),
}).describe('Palette MCP Server 설정 - Figma 디자인을 Design System 컴포넌트로 변환');

// Smithery 설정 타입
type SmitheryConfig = z.infer<typeof configSchema>;

// 기본 설정 (필수 토큰은 런타임에 제공됨)
const defaultConfig: Partial<SmitheryConfig> = {
  FIGMA_MCP_SERVER_URL: 'http://127.0.0.1:3845/mcp',
};

/**
 * MCP 서버 생성 함수 - Smithery가 호출
 */
export default function createMcpServer({ config }: { config?: Partial<SmitheryConfig> } = {}) {
  // config 병합
  const safeConfig = { ...defaultConfig, ...config };

  // 환경변수 설정 (값이 있는 경우에만)
  if (safeConfig.FIGMA_ACCESS_TOKEN) {
    process.env.FIGMA_ACCESS_TOKEN = safeConfig.FIGMA_ACCESS_TOKEN;
  }
  if (safeConfig.GITHUB_TOKEN) {
    process.env.GITHUB_TOKEN = safeConfig.GITHUB_TOKEN;
  }
  if (safeConfig.FIGMA_MCP_SERVER_URL) {
    process.env.FIGMA_MCP_SERVER_URL = safeConfig.FIGMA_MCP_SERVER_URL;
  }

  // 공통 서버 생성 로직 사용
  // Remote 모드에서는 Figma Desktop MCP 클라이언트를 사용하지 않음 (로컬호스트 접근 불가)
  const server = createPaletteServer({
    figmaAccessToken: safeConfig.FIGMA_ACCESS_TOKEN,
    githubToken: safeConfig.GITHUB_TOKEN,
    figmaMcpServerUrl: safeConfig.FIGMA_MCP_SERVER_URL,
    useFigmaMcp: false, // Remote 모드에서는 Figma REST API만 사용
  });

  console.error('Palette MCP server created for Smithery (Remote mode)');

  return server;
}

// 직접 실행 시에만 서버 시작 (Smithery에서 import할 때는 실행 안됨)
// Smithery는 createStatelessServer를 내부적으로 호출함
if (process.env.SMITHERY_STANDALONE === 'true') {
  const { app } = createStatelessServer(createMcpServer);
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.error(`Palette MCP server listening on port ${port}`);
  });
}
