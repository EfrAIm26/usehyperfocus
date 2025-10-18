// Mermaid configuration - Centralized and optimized
import mermaid from 'mermaid';

// Initialize Mermaid ONCE with error suppression
let mermaidInitialized = false;

export function initializeMermaid() {
  if (mermaidInitialized) return;
  
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    suppressErrorRendering: true, // CRITICAL: Suppress visual error messages
    logLevel: 'error', // Minimize console logging
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 20,
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
      padding: 40,
      nodeSpacing: 100,
      rankSpacing: 100,
    },
    mindmap: {
      padding: 50,
      maxNodeWidth: 300,
      useMaxWidth: true,
    },
    gantt: {
      fontSize: 18,
      numberSectionStyles: 4,
      axisFormat: '%d/%m',
      barHeight: 35,
      barGap: 10,
    },
    sequence: {
      actorMargin: 100,
      boxMargin: 20,
      messageMargin: 50,
    },
    themeVariables: {
      fontSize: '20px',
      fontFamily: 'Inter, system-ui, sans-serif',
      primaryColor: '#e0f2fe',
      primaryTextColor: '#0c4a6e',
      primaryBorderColor: '#0ea5e9',
      lineColor: '#64748b',
      secondaryColor: '#f1f5f9',
      tertiaryColor: '#fef3c7',
    },
  });
  
  mermaidInitialized = true;
}

// Safe render function that cleans up error elements
export async function renderMermaid(id: string, code: string): Promise<{ svg: string }> {
  // Ensure initialized
  initializeMermaid();
  
  try {
    const result = await mermaid.render(id, code);
    
    // Clean up any error elements that Mermaid might inject
    const errorElements = document.querySelectorAll('[data-mermaid-error]');
    errorElements.forEach(el => el.remove());
    
    return result;
  } catch (error) {
    // Silently fail - do NOT show errors in UI
    console.warn('Mermaid render failed silently:', error);
    
    // Clean up any error elements
    const errorElements = document.querySelectorAll('[data-mermaid-error], .mermaid-error, [id^="dmermaid-"]');
    errorElements.forEach(el => el.remove());
    
    throw error;
  }
}

// Clean up all Mermaid error elements from DOM
export function cleanupMermaidErrors() {
  const errorSelectors = [
    '[data-mermaid-error]',
    '.mermaid-error',
    '[id^="dmermaid-"]',
    '.error-icon',
    'svg[id^="mermaid-"]',
  ];
  
  errorSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el.textContent?.includes('Syntax error')) {
        el.remove();
      }
    });
  });
}

