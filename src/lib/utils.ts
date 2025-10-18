// Utility functions for Hyperfocus AI

import type { DiagramDetectionResult } from '../types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract Mermaid code and explanation from AI response
 */
export function extractContent(text: string): DiagramDetectionResult {
  // Try to find mermaid code block
  const mermaidRegex = /```mermaid\s*([\s\S]*?)```/i;
  const match = text.match(mermaidRegex);

  if (match) {
    const mermaidCode = match[1].trim();
    const explanation = text.replace(match[0], '').trim();
    return {
      hasDiagram: true,
      mermaidCode,
      explanation,
    };
  }

  // Check for direct Mermaid syntax without code block
  const directDiagramPatterns = [
    /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|quadrantChart|sankey)/im
  ];

  for (const pattern of directDiagramPatterns) {
    if (pattern.test(text)) {
      return {
        hasDiagram: true,
        mermaidCode: text.trim(),
        explanation: '',
      };
    }
  }

  return {
    hasDiagram: false,
    mermaidCode: null,
    explanation: text,
  };
}

/**
 * Format date to readable string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  // Different year
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Generate a title from the first message
 */
export function generateTitle(text: string): string {
  const cleaned = text.trim().slice(0, 50);
  return cleaned.length < text.trim().length ? `${cleaned}...` : cleaned;
}

/**
 * Check if text contains diagram keywords
 */
export function containsDiagramKeywords(text: string): boolean {
  const keywords = [
    'diagram', 'mind map', 'mindmap', 'flowchart', 'visualize', 
    'chart', 'graph', 'draw', 'sketch', 'map', 'mermaid',
    'sequence', 'class diagram', 'gantt', 'timeline', 'pie chart',
    'show me', 'create a', 'make a', 'generate'
  ];
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}


