import { FigmaFile, FigmaNode } from './figma.js';
import { DesignSystemService, DesignSystemComponent } from './design-system.js';

export interface GeneratedComponent {
  name: string;
  code: string;
  imports: string[];
  dependencies: string[];
}

export class CodeGenerator {
  constructor(private designSystemService: DesignSystemService) {}

  /**
   * Figma 데이터에서 React 컴포넌트 생성
   */
  async generateReactComponent(
    figmaData: FigmaFile,
    componentName: string
  ): Promise<string> {
    const imports = new Set<string>();
    const dependencies = new Set<string>();
    let componentCode = '';

    // Figma 구조 분석 및 디자인 시스템 컴포넌트 매핑
    const mappedComponents = this.mapFigmaToDesignSystem(figmaData.document, 'react');
    
    // Generate imports
    for (const mapping of mappedComponents) {
      if (mapping.designSystemComponent) {
        imports.add(`import { ${mapping.designSystemComponent.name} } from '${mapping.designSystemComponent.importPath}';`);
        if (mapping.designSystemComponent.dependencies) {
          mapping.designSystemComponent.dependencies.forEach(dep => dependencies.add(dep));
        }
      }
    }

    // 컴포넌트 구조 생성
    componentCode += this.generateReactComponentStructure(
      componentName,
      figmaData.document,
      mappedComponents
    );

    // 최상단에 임포트 추가
    const importsCode = Array.from(imports).join('\n');
    const dependenciesCode = Array.from(dependencies).length > 0 
      ? `\n// Dependencies: ${Array.from(dependencies).join(', ')}` 
      : '';

    // GitHub 저장소 정보 추가
    const repositoryInfo = `// Design System Components from GitHub:
// React: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system-react
// Vue: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system
// 
// To use these components, install the packages:
// npm install @dealicious/design-system-react @dealicious/design-system
// or
// yarn add @dealicious/design-system-react @dealicious/design-system
`;

    return `${repositoryInfo}\n${importsCode}${dependenciesCode}\n\n${componentCode}`;
  }

  /**
   * Figma 데이터에서 Vue 컴포넌트 생성
   */
  async generateVueComponent(
    figmaData: FigmaFile,
    componentName: string
  ): Promise<string> {
    const imports = new Set<string>();
    const dependencies = new Set<string>();
    let componentCode = '';

    // Figma 구조 분석 및 디자인 시스템 컴포넌트 매핑
    const mappedComponents = this.mapFigmaToDesignSystem(figmaData.document, 'vue');
    
    // Generate imports
    for (const mapping of mappedComponents) {
      if (mapping.designSystemComponent) {
        // Vue는 default import 사용하는 것을 권장
        imports.add(`import ${mapping.designSystemComponent.name} from '${mapping.designSystemComponent.importPath}';`);
        if (mapping.designSystemComponent.dependencies) {
          mapping.designSystemComponent.dependencies.forEach(dep => dependencies.add(dep));
        }
      }
    }

    // 컴포넌트 구조 생성
    componentCode += this.generateVueComponentStructure(
      componentName,
      figmaData.document,
      mappedComponents
    );

    // 최상단에 임포트 추가
    const importsCode = Array.from(imports).join('\n');
    const dependenciesCode = Array.from(dependencies).length > 0 
      ? `\n// Dependencies: ${Array.from(dependencies).join(', ')}` 
      : '';

    return `${importsCode}${dependenciesCode}\n\n${componentCode}`;
  }

  /**
   * Figma 노드를 디자인 시스템 컴포넌트에 매핑
   */
  private mapFigmaToDesignSystem(
    node: FigmaNode,
    framework: 'react' | 'vue'
  ): Array<{
    figmaNode: FigmaNode;
    designSystemComponent: DesignSystemComponent;
    confidence: number;
  }> {
    const mappings: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }> = [];

    // 현재 노드 분석
    const mapping = this.analyzeNode(node, framework);
    mappings.push(mapping);

    // 자식 노드 재귀적 분석
    if (node.children) {
      for (const child of node.children) {
        mappings.push(...this.mapFigmaToDesignSystem(child, framework));
      }
    }

    return mappings;
  }

  /**
   * 단일 Figma 노드 분석 및 디자인 시스템 최적 매칭 찾기
   * 항상 디자인 시스템 컴포넌트를 반환 - null이 아님
   */
  private analyzeNode(
    node: FigmaNode,
    framework: 'react' | 'vue'
  ): {
    figmaNode: FigmaNode;
    designSystemComponent: DesignSystemComponent;
    confidence: number;
  } {
    // 보이지 않는 노드 건너뛰기
    if (node.visible === false) {
      const defaultComponent = this.designSystemService.getComponent('Card', framework);
      if (!defaultComponent) {
        // Card는 항상 사용 가능하므로 이 경우는 절대 발생하지 않음
        throw new Error('No Design System components available');
      }
      return {
        figmaNode: node,
        designSystemComponent: defaultComponent,
        confidence: 0.1,
      };
    }

    // 노드 속성에 따라 매칭 컴포넌트 찾기
    let component = this.findComponentByNodeProperties(node, framework);
    
    // 매칭 컴포넌트가 없으면 노드 유형에 따라 기본 컴포넌트 사용
    if (!component) {
      component = this.getDefaultComponentByType(node, framework);
    }
    
    return {
      figmaNode: node,
      designSystemComponent: component,
      confidence: 0.8,
    };
  }

  /**
   * Figma 노드 속성에 따라 디자인 시스템 컴포넌트 찾기
   * 일반적인 패턴 기반 유사 매칭
   */
  private findComponentByNodeProperties(
    node: FigmaNode,
    framework: 'react' | 'vue'
  ): DesignSystemComponent | null {
    const nodeName = node.name.toLowerCase();
    const nodeType = node.type;

    // 1. 직접 이름 매칭
    let component = this.designSystemService.findBestMatch(nodeName, framework);
    if (component) return component;

    // 2. 일반적인 패턴 기반 유사 매칭
    const enhancedMappings = [
      { patterns: ['btn', 'button', 'click', 'submit', 'action'], component: 'Button' },
      { patterns: ['input', 'field', 'text', 'search', 'email'], component: 'Input' },
      { patterns: ['card', 'panel', 'container', 'box', 'wrapper'], component: 'Card' },
      { patterns: ['modal', 'dialog', 'popup', 'overlay'], component: 'Modal' },
      { patterns: ['table', 'grid', 'list', 'data'], component: 'Table' },
    ];

    for (const mapping of enhancedMappings) {
      if (mapping.patterns.some(pattern => nodeName.includes(pattern))) {
        const foundComponent = this.designSystemService.getComponent(mapping.component, framework);
        if (foundComponent) return foundComponent;
      }
    }

    // 3. 타입 기반 매칭
    switch (nodeType) {
      case 'TEXT':
        // Text 노드 - 버튼 레이블인지 확인
        if (nodeName.includes('button') || nodeName.includes('btn') || nodeName.includes('click')) {
          return this.designSystemService.getComponent('Button', framework);
        }
        // 기본 텍스트로 Card 사용
        return this.designSystemService.getComponent('Card', framework);
        
      case 'FRAME':
        // Frames - 일반적인 패턴 기반 유사 매칭
        if (nodeName.includes('card') || nodeName.includes('panel') || nodeName.includes('container')) {
          return this.designSystemService.getComponent('Card', framework);
        }
        if (nodeName.includes('modal') || nodeName.includes('dialog') || nodeName.includes('popup')) {
          return this.designSystemService.getComponent('Modal', framework);
        }
        // 기본 프레임으로 Card 사용
        return this.designSystemService.getComponent('Card', framework);
        
      case 'COMPONENT':
        // Component 인스턴스 - 일반적인 패턴 기반 유사 매칭
        component = this.designSystemService.findBestMatch(nodeName, framework);
        if (component) return component;
        // 기본 컴포넌트로 Card 사용
        return this.designSystemService.getComponent('Card', framework);
        
      case 'RECTANGLE':
        // Rectangles - 일반적인 패턴 기반 유사 매칭
        if (nodeName.includes('button') || nodeName.includes('btn') || nodeName.includes('click')) {
          return this.designSystemService.getComponent('Button', framework);
        }
        if (nodeName.includes('input') || nodeName.includes('field') || nodeName.includes('text')) {
          return this.designSystemService.getComponent('Input', framework);
        }
        if (nodeName.includes('card') || nodeName.includes('panel') || nodeName.includes('container')) {
          return this.designSystemService.getComponent('Card', framework);
        }
        // 기본 사각형으로 Button 사용 (가장 일반적인 상호 작용 요소)
        return this.designSystemService.getComponent('Button', framework);
        
      default:
        // 기본 폴백으로 Card 사용
        return this.designSystemService.getComponent('Card', framework);
    }
  }

  /**
   * 기본 디자인 시스템 컴포넌트 가져오기
   */
  private async getDefaultComponent(framework: 'react' | 'vue'): Promise<DesignSystemComponent> {
    const cardComponent = this.designSystemService.getComponent('Card', framework);
    if (cardComponent) return cardComponent;
    
    const components = await this.designSystemService.getAvailableComponents(framework);
    return components[0];
  }

  /**
   * 노드 유형에 따라 기본 컴포넌트 가져오기
   */
  private getDefaultComponentByType(node: FigmaNode, framework: 'react' | 'vue'): DesignSystemComponent {
    const nodeType = node.type;
    const nodeName = node.name.toLowerCase();

    // 노드 유형과 이름에 따라 스마트 기본값
    switch (nodeType) {
      case 'TEXT':
        if (nodeName.includes('button') || nodeName.includes('btn') || nodeName.includes('click')) {
          const buttonComponent = this.designSystemService.getComponent('Button', framework);
          if (buttonComponent) return buttonComponent;
        }
        const cardComponent = this.designSystemService.getComponent('Card', framework);
        if (cardComponent) return cardComponent;
        break;
        
      case 'RECTANGLE':
        if (nodeName.includes('input') || nodeName.includes('field')) {
          const inputComponent = this.designSystemService.getComponent('Input', framework);
          if (inputComponent) return inputComponent;
        }
        if (nodeName.includes('button') || nodeName.includes('btn')) {
          const buttonComponent = this.designSystemService.getComponent('Button', framework);
          if (buttonComponent) return buttonComponent;
        }
        const buttonComponent2 = this.designSystemService.getComponent('Button', framework);
        if (buttonComponent2) return buttonComponent2;
        break;
        
      case 'FRAME':
        if (nodeName.includes('modal') || nodeName.includes('dialog')) {
          const modalComponent = this.designSystemService.getComponent('Modal', framework);
          if (modalComponent) return modalComponent;
        }
        const cardComponent2 = this.designSystemService.getComponent('Card', framework);
        if (cardComponent2) return cardComponent2;
        break;
        
      default:
        const defaultCardComponent = this.designSystemService.getComponent('Card', framework);
        if (defaultCardComponent) return defaultCardComponent;
        break;
    }
    
    // 최종 폴백 - Card를 마지막 수단으로 사용
    const finalCardComponent = this.designSystemService.getComponent('Card', framework);
    if (finalCardComponent) return finalCardComponent;
    
    // Card는 항상 사용 가능하므로 이 경우는 절대 발생하지 않음
    throw new Error('No Design System components available');
  }

  /**
   * React 컴포넌트 구조 생성
   */
  private generateReactComponentStructure(
    componentName: string,
    rootNode: FigmaNode,
    mappedComponents: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }>
  ): string {
    let code = `import React from 'react';\n\n`;
    
    code += `interface ${componentName}Props {\n`;
    code += `  // Add your props here\n`;
    code += `}\n\n`;
    
    code += `const ${componentName}: React.FC<${componentName}Props> = (props) => {\n`;
    code += `  return (\n`;
    code += `    <div className="${this.generateClassName(rootNode)}">\n`;
    
    // 매핑된 컴포넌트에 따라 JSX 생성
    code += this.generateReactJSX(rootNode, mappedComponents, 2);
    
    code += `    </div>\n`;
    code += `  );\n`;
    code += `};\n\n`;
    code += `export default ${componentName};\n`;
    
    return code;
  }

  /**
   * Vue 컴포넌트 구조 생성
   */
  private generateVueComponentStructure(
    componentName: string,
    rootNode: FigmaNode,
    mappedComponents: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }>
  ): string {
    let code = `<template>\n`;
    code += `  <div class="${this.generateClassName(rootNode)}">\n`;
    
    // 매핑된 컴포넌트에 따라 템플릿 생성
    code += this.generateVueTemplate(rootNode, mappedComponents, 2);
    
    code += `  </div>\n`;
    code += `</template>\n\n`;
    
    code += `<script setup lang="ts">\n`;
    code += `// Add your reactive data and methods here\n`;
    code += `</script>\n\n`;
    
    code += `<style scoped>\n`;
    code += `.${this.generateClassName(rootNode)} {\n`;
    code += `  /* Add your styles here */\n`;
    code += `}\n`;
    code += `</style>\n`;
    
    return code;
  }

  /**
   * Figma 노드에서 React JSX 생성
   */
  private generateReactJSX(
    node: FigmaNode,
    mappedComponents: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }>,
    indent: number = 0
  ): string {
    const indentStr = '  '.repeat(indent);
    let jsx = '';

    // 현재 노드에 대한 매핑 찾기
    const mapping = mappedComponents.find(m => m.figmaNode.id === node.id);
    
    // 항상 디자인 시스템 컴포넌트 사용 - HTML로 폴백하지 않음
    if (mapping?.designSystemComponent) {
      const component = mapping.designSystemComponent;
      const props = this.generateComponentProps(node, component);
      jsx += `${indentStr}<${component.name}${props}>\n`;
      
      if (node.children) {
        for (const child of node.children) {
          jsx += this.generateReactJSX(child, mappedComponents, indent + 1);
        }
      } else if (node.characters) {
        jsx += `${indentStr}  ${node.characters}\n`;
      }
      
      jsx += `${indentStr}</${component.name}>\n`;
    } else {
      // 일반적인 패턴 기반 유사 매칭을 사용하므로 이 경우는 절대 발생하지 않음
      console.warn(`No Design System component found for node ${node.id}, using Card as fallback`);
      const fallbackComponent = this.designSystemService.getComponent('Card', 'react');
      if (fallbackComponent) {
        jsx += `${indentStr}<${fallbackComponent.name}>\n`;
        
        if (node.children) {
          for (const child of node.children) {
            jsx += this.generateReactJSX(child, mappedComponents, indent + 1);
          }
        } else if (node.characters) {
          jsx += `${indentStr}  ${node.characters}\n`;
        }
        
        jsx += `${indentStr}</${fallbackComponent.name}>\n`;
      }
    }

    return jsx;
  }

  /**
   * Figma 노드에서 Vue 템플릿 생성
   */
  private generateVueTemplate(
    node: FigmaNode,
    mappedComponents: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }>,
    indent: number = 0
  ): string {
    const indentStr = '  '.repeat(indent);
    let template = '';

    // 현재 노드에 대한 매핑 찾기
    const mapping = mappedComponents.find(m => m.figmaNode.id === node.id);
    
    // 항상 디자인 시스템 컴포넌트 사용 - HTML로 폴백하지 않음
    if (mapping?.designSystemComponent) {
      const component = mapping.designSystemComponent;
      const props = this.generateComponentProps(node, component);
      template += `${indentStr}<${component.name}${props}>\n`;
      
      if (node.children) {
        for (const child of node.children) {
          template += this.generateVueTemplate(child, mappedComponents, indent + 1);
        }
      } else if (node.characters) {
        template += `${indentStr}  ${node.characters}\n`;
      }
      
      template += `${indentStr}</${component.name}>\n`;
    } else {
      // 일반적인 패턴 기반 유사 매칭을 사용하므로 이 경우는 절대 발생하지 않음
      console.warn(`No Design System component found for node ${node.id}, using Card as fallback`);
      const fallbackComponent = this.designSystemService.getComponent('Card', 'vue');
      if (fallbackComponent) {
        template += `${indentStr}<${fallbackComponent.name}>\n`;
        
        if (node.children) {
          for (const child of node.children) {
            template += this.generateVueTemplate(child, mappedComponents, indent + 1);
          }
        } else if (node.characters) {
          template += `${indentStr}  ${node.characters}\n`;
        }
        
        template += `${indentStr}</${fallbackComponent.name}>\n`;
      }
    }

    return template;
  }

  /**
   * Figma 노드와 디자인 시스템 컴포넌트에 따라 컴포넌트 속성 생성
   */
  private generateComponentProps(
    node: FigmaNode,
    component: DesignSystemComponent
  ): string {
    const props: string[] = [];

    // 노드 속성에 따라 공통 속성 추가
    if (node.characters && component.name === 'Button') {
      props.push(`>${node.characters}`);
    }

    if (node.characters && component.name === 'Input') {
      props.push(`placeholder="${node.characters}"`);
    }

    if (component.name === 'Card' && node.name.toLowerCase().includes('title')) {
      props.push(`title="${node.characters || node.name}"`);
    }

    // 바운딩 박스에 따라 크기 속성 추가
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      
      if (component.name === 'Button') {
        if (height < 32) props.push('size="small"');
        else if (height > 48) props.push('size="large"');
        else props.push('size="medium"');
      }
    }

    return props.length > 0 ? ` ${props.join(' ')}` : '';
  }

  /**
   * Figma 노드에 대한 적절한 HTML 태그 이름 가져오기
   */
  private getHTMLTagName(node: FigmaNode): string {
    switch (node.type) {
      case 'TEXT':
        return 'span';
      case 'FRAME':
        return 'div';
      case 'RECTANGLE':
        return 'div';
      case 'ELLIPSE':
        return 'div';
      default:
        return 'div';
    }
  }

  /**
   * Figma 노드에서 CSS 클래스 이름 생성
   */
  private generateClassName(node: FigmaNode): string {
    const name = node.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${name}-${node.id.slice(-4)}`;
  }

  /**
   * Figma 노드 속성에서 인라인 스타일 생성
   */
  private generateInlineStyle(node: FigmaNode): string {
    const styles: string[] = [];

    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      styles.push(`width: ${width}px`);
      styles.push(`height: ${height}px`);
    }

    if (node.cornerRadius) {
      styles.push(`border-radius: ${node.cornerRadius}px`);
    }

    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b, a } = fill.color;
        const alpha = a !== undefined ? a : 1;
        styles.push(`background-color: rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`);
      }
    }

    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.type === 'SOLID' && stroke.color) {
        const { r, g, b, a } = stroke.color;
        const alpha = a !== undefined ? a : 1;
        styles.push(`border: ${stroke.strokeWeight || 1}px solid rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`);
      }
    }

    return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
  }
}
