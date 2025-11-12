#!/usr/bin/env node

// .env 파일 로드
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 프로젝트 루트의 .env 파일 로드
dotenv.config({ path: join(__dirname, '..', '.env') });

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { FigmaService } from './services/figma.js';
import { DesignSystemService } from './services/design-system.js';
import { CodeGenerator } from './services/code-generator.js';

// MCP 서버 초기화
const server = new Server(
  {
    name: 'palette',
    version: '1.0.0',
  }
);

// Figma 및 Design System 서비스 초기화
const figmaService = new FigmaService();
const designSystemService = new DesignSystemService();
const codeGenerator = new CodeGenerator(designSystemService);

// 사용 가능한 도구 목록
const tools: Tool[] = [
  {
    name: 'convert_figma_to_react',
    description: 'Convert Figma design to React component using existing design system',
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma file URL or file ID',
        },
        nodeId: {
          type: 'string',
          description: 'Specific node ID to convert (optional)',
        },
        componentName: {
          type: 'string',
          description: 'Name for the generated component',
        },
      },
      required: ['figmaUrl', 'componentName'],
    },
  },
  {
    name: 'convert_figma_to_vue',
    description: 'Convert Figma design to Vue component using existing design system',
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma file URL or file ID',
        },
        nodeId: {
          type: 'string',
          description: 'Specific node ID to convert (optional)',
        },
        componentName: {
          type: 'string',
          description: 'Name for the generated component',
        },
      },
      required: ['figmaUrl', 'componentName'],
    },
  },
  {
    name: 'list_design_system_components',
    description: 'List available components in the design system',
    inputSchema: {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          enum: ['react', 'vue'],
          description: 'Framework to list components for',
        },
      },
      required: ['framework'],
    },
  },
  {
    name: 'analyze_figma_file',
    description: 'Analyze Figma file structure and available components',
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma file URL or file ID',
        },
      },
      required: ['figmaUrl'],
    },
  },
];

// 도구 목록 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// 도구 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'convert_figma_to_react': {
        const { figmaUrl, nodeId, componentName } = args as {
          figmaUrl: string;
          nodeId?: string;
          componentName: string;
        };

        const figmaData = await figmaService.getFigmaData(figmaUrl, nodeId);
        const files = await codeGenerator.generateAndSaveReactComponent(
          figmaData,
          componentName,
          figmaUrl,
          nodeId
        );

        return {
          content: [
            {
              type: 'text',
              text: `# React Component Generated\n\n**요청 ID:** \`${files.requestId}\`\n**저장 경로:** \`${files.folderPath}\`\n\n## 생성된 파일\n- 컴포넌트: \`${files.componentFile}\`\n- HTML 미리보기: \`${files.htmlFile}\`\n- 메타데이터: \`${files.metadataFile}\`\n\n## 컴포넌트 코드\n\n\`\`\`tsx\n${await readFile(files.componentFile, 'utf-8')}\n\`\`\``,
            },
          ],
        };
      }

      case 'convert_figma_to_vue': {
        const { figmaUrl, nodeId, componentName } = args as {
          figmaUrl: string;
          nodeId?: string;
          componentName: string;
        };

        const figmaData = await figmaService.getFigmaData(figmaUrl, nodeId);
        const files = await codeGenerator.generateAndSaveVueComponent(
          figmaData,
          componentName,
          figmaUrl,
          nodeId
        );

        return {
          content: [
            {
              type: 'text',
              text: `# Vue Component Generated\n\n**요청 ID:** \`${files.requestId}\`\n**저장 경로:** \`${files.folderPath}\`\n\n## 생성된 파일\n- 컴포넌트: \`${files.componentFile}\`\n- HTML 미리보기: \`${files.htmlFile}\`\n- 메타데이터: \`${files.metadataFile}\`\n\n## 컴포넌트 코드\n\n\`\`\`vue\n${await readFile(files.componentFile, 'utf-8')}\n\`\`\``,
            },
          ],
        };
      }

      case 'list_design_system_components': {
        const { framework } = args as { framework: 'react' | 'vue' };
        const components = await designSystemService.getAvailableComponents(framework);

        return {
          content: [
            {
              type: 'text',
              text: `# Available ${framework} Components\n\n${components
                .map((comp) => `- **${comp.name}**: ${comp.description}`)
                .join('\n')}`,
            },
          ],
        };
      }

      case 'analyze_figma_file': {
        const { figmaUrl } = args as { figmaUrl: string };
        const analysis = await figmaService.analyzeFigmaFile(figmaUrl);

        return {
          content: [
            {
              type: 'text',
              text: `# Figma File Analysis\n\n${analysis}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Palette server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
