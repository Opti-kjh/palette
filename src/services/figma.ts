import axios from 'axios';

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    gradientStops?: Array<{
      position: number;
      color: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
    }>;
  }>;
  strokes?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    strokeWeight?: number;
  }>;
  cornerRadius?: number;
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
  };
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, FigmaNode>;
  styles: Record<string, any>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
}

export interface FigmaAnalysis {
  totalNodes: number;
  componentCount: number;
  frameCount: number;
  textCount: number;
  availableComponents: string[];
  suggestedMappings: Array<{
    figmaComponent: string;
    designSystemComponent: string;
    confidence: number;
  }>;
}

export class FigmaService {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor() {
    this.accessToken = process.env.FIGMA_ACCESS_TOKEN || '';
    if (!this.accessToken) {
      console.warn('환경 변수에서 FIGMA_ACCESS_TOKEN을 찾을 수 없습니다.');
    }
  }

  /**
   * Figma URL에서 파일 ID 추출
   */
  private extractFileId(url: string): string {
    const match = url.match(/\/file\/([a-zA-Z0-9]+)/);
    if (match) {
      return match[1];
    }
    // 이미 파일 ID인 경우
    if (/^[a-zA-Z0-9]+$/.test(url)) {
      return url;
    }
    throw new Error('잘못된 Figma URL 형식입니다.');
  }

  /**
   * Figma 파일 데이터 가져오기
   */
  async getFigmaData(url: string, nodeId?: string): Promise<FigmaFile> {
    const fileId = this.extractFileId(url);
    
    if (!this.accessToken) {
      throw new Error('Figma 액세스 토큰이 필요합니다.');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/files/${fileId}`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
        params: {
          ids: nodeId || undefined,
        },
      });

      return {
        document: response.data.document,
        components: response.data.components || {},
        styles: response.data.styles || {},
        name: response.data.name,
        lastModified: response.data.lastModified,
        thumbnailUrl: response.data.thumbnailUrl,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Figma 파일 구조 분석
   */
  async analyzeFigmaFile(url: string): Promise<string> {
    const fileData = await this.getFigmaData(url);
    
    const analysis = this.analyzeFileStructure(fileData);
    
    return this.formatAnalysis(analysis);
  }

  /**
   * 파일 구조 분석 및 컴포넌트 정보 추출
   */
  private analyzeFileStructure(file: FigmaFile): FigmaAnalysis {
    const stats = this.countNodes(file.document);
    const availableComponents = Object.keys(file.components);
    
    return {
      totalNodes: stats.total,
      componentCount: stats.components,
      frameCount: stats.frames,
      textCount: stats.text,
      availableComponents,
      suggestedMappings: this.suggestComponentMappings(availableComponents),
    };
  }

  /**
   * 파일에 있는 다른 유형의 노드 수 세기
   */
  private countNodes(node: FigmaNode): {
    total: number;
    components: number;
    frames: number;
    text: number;
  } {
    let total = 1;
    let components = node.type === 'COMPONENT' ? 1 : 0;
    let frames = node.type === 'FRAME' ? 1 : 0;
    let text = node.type === 'TEXT' ? 1 : 0;

    if (node.children) {
      for (const child of node.children) {
        const childStats = this.countNodes(child);
        total += childStats.total;
        components += childStats.components;
        frames += childStats.frames;
        text += childStats.text;
      }
    }

    return { total, components, frames, text };
  }

  /**
   * Figma 컴포넌트와 디자인 시스템 컴포넌트 간의 매핑 제안
   */
  private suggestComponentMappings(figmaComponents: string[]): Array<{
    figmaComponent: string;
    designSystemComponent: string;
    confidence: number;
  }> {
    const mappings: Array<{
      figmaComponent: string;
      designSystemComponent: string;
      confidence: number;
    }> = [];

    // 일반적인 컴포넌트 이름 매핑
    const commonMappings: Record<string, string[]> = {
      'button': ['Button', 'Btn', 'PrimaryButton', 'SecondaryButton'],
      'input': ['Input', 'TextField', 'TextInput'],
      'card': ['Card', 'Panel', 'Container'],
      'modal': ['Modal', 'Dialog', 'Popup'],
      'header': ['Header', 'Navbar', 'Navigation'],
      'footer': ['Footer', 'BottomBar'],
      'sidebar': ['Sidebar', 'Drawer', 'Navigation'],
      'form': ['Form', 'FormGroup'],
      'table': ['Table', 'DataTable'],
      'list': ['List', 'ListItem'],
      'avatar': ['Avatar', 'ProfileImage'],
      'badge': ['Badge', 'Tag', 'Label'],
      'tooltip': ['Tooltip', 'Popover'],
      'dropdown': ['Dropdown', 'Select'],
      'checkbox': ['Checkbox', 'CheckBox'],
      'radio': ['Radio', 'RadioButton'],
      'switch': ['Switch', 'Toggle'],
      'slider': ['Slider', 'Range'],
      'progress': ['Progress', 'ProgressBar'],
      'spinner': ['Spinner', 'Loader'],
      'alert': ['Alert', 'Notification'],
      'breadcrumb': ['Breadcrumb', 'Breadcrumbs'],
      'pagination': ['Pagination', 'Pager'],
      'tabs': ['Tabs', 'TabList'],
      'accordion': ['Accordion', 'Collapse'],
      'carousel': ['Carousel', 'Slider'],
      'stepper': ['Stepper', 'Steps'],
    };

    for (const figmaComponent of figmaComponents) {
      const lowerName = figmaComponent.toLowerCase();
      
      for (const [key, possibleNames] of Object.entries(commonMappings)) {
        for (const possibleName of possibleNames) {
          if (lowerName.includes(key) || lowerName.includes(possibleName.toLowerCase())) {
            mappings.push({
              figmaComponent,
              designSystemComponent: possibleName,
              confidence: 0.8,
            });
            break;
          }
        }
      }
    }

    return mappings;
  }

  /**
   * 분석 결과 표시 형식 지정
   */
  private formatAnalysis(analysis: FigmaAnalysis): string {
    let result = `## Figma File Analysis\n\n`;
    result += `**File Statistics:**\n`;
    result += `- Total Nodes: ${analysis.totalNodes}\n`;
    result += `- Components: ${analysis.componentCount}\n`;
    result += `- Frames: ${analysis.frameCount}\n`;
    result += `- Text Elements: ${analysis.textCount}\n\n`;

    if (analysis.availableComponents.length > 0) {
      result += `**Available Components:**\n`;
      analysis.availableComponents.forEach(comp => {
        result += `- ${comp}\n`;
      });
      result += `\n`;
    }

    if (analysis.suggestedMappings.length > 0) {
      result += `**Suggested Component Mappings:**\n`;
      analysis.suggestedMappings.forEach(mapping => {
        result += `- ${mapping.figmaComponent} → ${mapping.designSystemComponent} (${Math.round(mapping.confidence * 100)}% confidence)\n`;
      });
    }

    return result;
  }

  /**
   * Figma 파일에서 디자인 토큰 추출
   */
  extractDesignTokens(file: FigmaFile): Record<string, any> {
    const tokens: Record<string, any> = {
      colors: {},
      typography: {},
      spacing: {},
      borderRadius: {},
    };

    // 스타일에서 색상 추출
    for (const [key, style] of Object.entries(file.styles)) {
      if (style.styleType === 'FILL') {
        tokens.colors[key] = style.description || key;
      }
    }

    // 타이포그래피 추출
    for (const [key, style] of Object.entries(file.styles)) {
      if (style.styleType === 'TEXT') {
        tokens.typography[key] = {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
        };
      }
    }

    return tokens;
  }
}
