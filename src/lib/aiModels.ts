// AI Models configuration with provider icons
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'perplexity' | 'moonshot';
  description: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Latest and most advanced OpenAI model',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and efficient GPT-4 optimized model',
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'moonshot',
    description: 'Advanced reasoning with 256K context',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Fast and powerful multimodal AI',
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

