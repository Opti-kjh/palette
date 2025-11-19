import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 요청 ID 생성 (타임스탬프 + 랜덤 문자열)
 */
export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * 요청별 폴더 경로 생성
 */
export function getRequestFolderPath(requestId: string): string {
  const projectRoot = join(__dirname, '..', '..');
  return join(projectRoot, 'dist', 'requests', requestId);
}

/**
 * 요청 폴더 생성
 */
export async function createRequestFolder(requestId: string): Promise<string> {
  const folderPath = getRequestFolderPath(requestId);
  
  if (!existsSync(folderPath)) {
    await mkdir(folderPath, { recursive: true });
  }
  
  return folderPath;
}

/**
 * 파일 저장
 */
export async function saveFile(
  requestId: string,
  filename: string,
  content: string
): Promise<string> {
  const folderPath = await createRequestFolder(requestId);
  const filePath = join(folderPath, filename);
  await writeFile(filePath, content, 'utf-8');
  return filePath;
}

/**
 * 바이너리 파일 저장 (이미지 등)
 */
export async function saveBinaryFile(
  requestId: string,
  filename: string,
  content: Buffer
): Promise<string> {
  const folderPath = await createRequestFolder(requestId);
  const filePath = join(folderPath, filename);
  await writeFile(filePath, content);
  return filePath;
}

/**
 * 요청 메타데이터 저장
 */
export interface RequestMetadata {
  requestId: string;
  type: 'react' | 'vue';
  componentName: string;
  figmaUrl: string;
  nodeId?: string;
  createdAt: string;
  files: Array<{
    name: string;
    path: string;
  }>;
}

export async function saveMetadata(
  requestId: string,
  metadata: Omit<RequestMetadata, 'requestId' | 'createdAt' | 'files'>
): Promise<string> {
  const folderPath = await createRequestFolder(requestId);
  const metadataPath = join(folderPath, 'metadata.json');
  
  const fullMetadata: RequestMetadata = {
    requestId,
    createdAt: new Date().toISOString(),
    files: [],
    ...metadata,
  };
  
  await writeFile(metadataPath, JSON.stringify(fullMetadata, null, 2), 'utf-8');
  return metadataPath;
}

