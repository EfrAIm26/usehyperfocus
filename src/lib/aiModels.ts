// AI Models configuration with provider icons
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'perplexity';
  description: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and efficient GPT-4 optimized model',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Fast and powerful multimodal AI',
  },
  {
    id: 'x-ai/grok-beta',
    name: 'Grok Beta',
    provider: 'xai',
    description: 'xAI\'s fast reasoning model',
  },
  {
    id: 'anthropic/claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    description: 'Powerful and balanced AI',
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude Haiku',
    provider: 'anthropic',
    description: 'Fast and efficient Claude model',
  },
  {
    id: 'perplexity/llama-3.1-sonar-large-128k-online',
    name: 'Sonar Deep Research',
    provider: 'perplexity',
    description: 'Research-focused with web access',
  },
];

export const DEFAULT_MODEL = 'openai/gpt-4o-mini';

