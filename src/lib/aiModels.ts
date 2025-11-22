// AI Models configuration with provider icons
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'perplexity' | 'moonshot';
  description: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'openai/gpt-5.1',
    name: 'GPT-5.1',
    provider: 'openai',
    description: 'Latest GPT-5 series model',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and efficient GPT-4 optimized model',
  },
  {
    id: 'moonshotai/kimi-k2-thinking',
    name: 'Kimi 2 Thinking',
    provider: 'moonshot',
    description: 'Advanced reasoning with 256K context',
  },
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    provider: 'google',
    description: 'Google\'s flagship frontier model (Preview)',
  },
  {
    id: 'x-ai/grok-4-fast',
    name: 'Grok 4 fast',
    provider: 'xai',
    description: 'xAI\'s fast reasoning model',
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    description: 'Powerful and balanced AI',
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    description: 'Fast and efficient Claude model',
  },
  {
    id: 'perplexity/sonar-deep-research',
    name: 'Sonar Deep Research',
    provider: 'perplexity',
    description: 'Research-focused with web access',
  },
];

export const DEFAULT_MODEL = 'openai/gpt-4o-mini';

