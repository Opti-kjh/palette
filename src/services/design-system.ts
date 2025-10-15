export interface DesignSystemComponent {
  name: string;
  description: string;
  category: string;
  props: ComponentProp[];
  examples: ComponentExample[];
  importPath: string;
  dependencies?: string[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface ComponentExample {
  name: string;
  code: string;
  description: string;
}

export class DesignSystemService {
  private reactComponents: DesignSystemComponent[] = [];
  private vueComponents: DesignSystemComponent[] = [];

  constructor() {
    this.initializeComponents();
  }

  /**
   * 디자인 시스템(React, Vue) 컴포넌트 메타데이터 제공 필요.
   * 1. 메타데이터 구조 정의
   * 2. 패키지에 manifest 추가.
   * 3. 디자인 시스템 패키지에서 export 된 컴포넌트 목록을 초기화.
   */
  private initializeComponents(): void {
    this.reactComponents = [
      {
        name: 'Button',
        description: 'Primary button component with multiple variants',
        category: 'Actions',
        importPath: '@dealicious/design-system-react/src/components/ssm-button',
        props: [
          {
            name: 'variant',
            type: "'primary' | 'secondary' | 'tertiary' | 'danger'",
            required: false,
            defaultValue: "'primary'",
            description: 'Button variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Button size',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the button is disabled',
          },
          {
            name: 'loading',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the button is in loading state',
          },
          {
            name: 'onClick',
            type: '() => void',
            required: false,
            description: 'Click handler function',
          },
        ],
        examples: [
          {
            name: 'Basic Button',
            code: '<Button>Click me</Button>',
            description: 'Basic button usage',
          },
          {
            name: 'Primary Button',
            code: '<Button variant="primary">Primary</Button>',
            description: 'Primary variant button',
          },
          {
            name: 'Loading Button',
            code: '<Button loading>Loading...</Button>',
            description: 'Button in loading state',
          },
        ],
      },
      {
        name: 'Input',
        description: 'Text input component with validation support',
        category: 'Forms',
        importPath: '@dealicious/design-system-react/src/components/ssm-input',
        props: [
          {
            name: 'type',
            type: "'text' | 'email' | 'password' | 'number'",
            required: false,
            defaultValue: "'text'",
            description: 'Input type',
          },
          {
            name: 'placeholder',
            type: 'string',
            required: false,
            description: 'Placeholder text',
          },
          {
            name: 'value',
            type: 'string',
            required: false,
            description: 'Input value',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the input is disabled',
          },
          {
            name: 'error',
            type: 'string',
            required: false,
            description: 'Error message to display',
          },
          {
            name: 'onChange',
            type: '(value: string) => void',
            required: false,
            description: 'Change handler function',
          },
        ],
        examples: [
          {
            name: 'Basic Input',
            code: '<Input placeholder="Enter text" />',
            description: 'Basic input field',
          },
          {
            name: 'Input with Error',
            code: '<Input error="This field is required" />',
            description: 'Input with error state',
          },
        ],
      },
      {
        name: 'Card',
        description: 'Card container component for content grouping',
        category: 'Layout',
        importPath: '@dealicious/design-system-react/src/components/ssm-card',
        props: [
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'Card title',
          },
          {
            name: 'subtitle',
            type: 'string',
            required: false,
            description: 'Card subtitle',
          },
          {
            name: 'elevation',
            type: 'number',
            required: false,
            defaultValue: '1',
            description: 'Card elevation level (0-3)',
          },
          {
            name: 'padding',
            type: "'none' | 'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Card padding size',
          },
        ],
        examples: [
          {
            name: 'Basic Card',
            code: '<Card title="Card Title">Card content</Card>',
            description: 'Basic card with title',
          },
          {
            name: 'Card with Elevation',
            code: '<Card elevation={2}>Elevated card</Card>',
            description: 'Card with custom elevation',
          },
        ],
      },
      {
        name: 'Modal',
        description: 'Modal dialog component for overlays',
        category: 'Overlays',
        importPath: '@dealicious/design-system-react/src/components/ssm-modal',
        props: [
          {
            name: 'isOpen',
            type: 'boolean',
            required: true,
            description: 'Whether the modal is open',
          },
          {
            name: 'onClose',
            type: '() => void',
            required: true,
            description: 'Function to close the modal',
          },
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'Modal title',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large' | 'fullscreen'",
            required: false,
            defaultValue: "'medium'",
            description: 'Modal size',
          },
        ],
        examples: [
          {
            name: 'Basic Modal',
            code: '<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">Modal content</Modal>',
            description: 'Basic modal usage',
          },
        ],
      },
      {
        name: 'Table',
        description: 'Data table component with sorting and pagination',
        category: 'Data Display',
        importPath: '@dealicious/design-system-react/src/components/ssm-table',
        props: [
          {
            name: 'data',
            type: 'Array<any>',
            required: true,
            description: 'Table data array',
          },
          {
            name: 'columns',
            type: 'Array<Column>',
            required: true,
            description: 'Table column definitions',
          },
          {
            name: 'sortable',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether columns are sortable',
          },
          {
            name: 'pagination',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether to show pagination',
          },
        ],
        examples: [
          {
            name: 'Basic Table',
            code: '<Table data={data} columns={columns} />',
            description: 'Basic table with data',
          },
        ],
      },
    ];

    this.vueComponents = [
      {
        name: 'Button',
        description: 'Primary button component with multiple variants',
        category: 'Actions',
        importPath: '@dealicious/design-system/src/components/ssm-button',
        props: [
          {
            name: 'variant',
            type: "'primary' | 'secondary' | 'tertiary' | 'danger'",
            required: false,
            defaultValue: "'primary'",
            description: 'Button variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Button size',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the button is disabled',
          },
          {
            name: 'loading',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the button is in loading state',
          },
        ],
        examples: [
          {
            name: 'Basic Button',
            code: '<Button>Click me</Button>',
            description: 'Basic button usage',
          },
          {
            name: 'Primary Button',
            code: '<Button variant="primary">Primary</Button>',
            description: 'Primary variant button',
          },
        ],
      },
      {
        name: 'Input',
        description: 'Text input component with validation support',
        category: 'Forms',
        importPath: '@dealicious/design-system/src/components/ssm-input',
        props: [
          {
            name: 'type',
            type: "'text' | 'email' | 'password' | 'number'",
            required: false,
            defaultValue: "'text'",
            description: 'Input type',
          },
          {
            name: 'placeholder',
            type: 'string',
            required: false,
            description: 'Placeholder text',
          },
          {
            name: 'modelValue',
            type: 'string',
            required: false,
            description: 'Input value (v-model)',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the input is disabled',
          },
          {
            name: 'error',
            type: 'string',
            required: false,
            description: 'Error message to display',
          },
        ],
        examples: [
          {
            name: 'Basic Input',
            code: '<Input placeholder="Enter text" v-model="value" />',
            description: 'Basic input field with v-model',
          },
          {
            name: 'Input with Error',
            code: '<Input error="This field is required" />',
            description: 'Input with error state',
          },
        ],
      },
      {
        name: 'Card',
        description: 'Card container component for content grouping',
        category: 'Layout',
        importPath: '@dealicious/design-system/src/components/ssm-card',
        props: [
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'Card title',
          },
          {
            name: 'subtitle',
            type: 'string',
            required: false,
            description: 'Card subtitle',
          },
          {
            name: 'elevation',
            type: 'number',
            required: false,
            defaultValue: '1',
            description: 'Card elevation level (0-3)',
          },
          {
            name: 'padding',
            type: "'none' | 'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Card padding size',
          },
        ],
        examples: [
          {
            name: 'Basic Card',
            code: '<Card title="Card Title">Card content</Card>',
            description: 'Basic card with title',
          },
        ],
      },
    ];
  }

  /**
   * 프레임워크(React 또는 Vue)에 대해 사용 가능한 구성 요소 가져오기
   */
  async getAvailableComponents(framework: 'react' | 'vue'): Promise<DesignSystemComponent[]> {
    return framework === 'react' ? this.reactComponents : this.vueComponents;
  }

  /**
   * Figma 컴포넌트(FigmaNode)에 가장 잘 맞는 컴포넌트(DesignSystemComponent) 찾기
   */
  findBestMatch(figmaComponentName: string, framework: 'react' | 'vue'): DesignSystemComponent | null {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    
    // Direct name match
    const directMatch = components.find(comp => 
      comp.name.toLowerCase() === figmaComponentName.toLowerCase()
    );
    if (directMatch) return directMatch;

    // 패턴 기반 유사 매칭
    const lowerName = figmaComponentName.toLowerCase();
    
    for (const component of components) {
      const componentName = component.name.toLowerCase();
      
      // Figma 이름에 컴포넌트 이름이 포함되어 있는지 확인
      if (lowerName.includes(componentName) || componentName.includes(lowerName)) {
        return component;
      }
      
      // 일반적인 변형 확인
      const variations = [
        componentName + 's', // 복수형
        componentName.replace('button', 'btn'),
        componentName.replace('input', 'field'),
        componentName.replace('card', 'panel'),
      ];
      
      for (const variation of variations) {
        if (lowerName.includes(variation) || variation.includes(lowerName)) {
          return component;
        }
      }
    }

    return null;
  }

  /**
   * 이름으로 컴포넌트 가져오기
   */
  getComponent(name: string, framework: 'react' | 'vue'): DesignSystemComponent | null {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    return components.find(comp => comp.name === name) || null;
  }

  /**
   * 카테고리로 컴포넌트 가져오기
   */
  getComponentsByCategory(category: string, framework: 'react' | 'vue'): DesignSystemComponent[] {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    return components.filter(comp => comp.category === category);
  }

  /**
   * 모든 가능한 카테고리 가져오기
   */
  getCategories(framework: 'react' | 'vue'): string[] {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    const categories = new Set(components.map(comp => comp.category));
    return Array.from(categories);
  }
}
