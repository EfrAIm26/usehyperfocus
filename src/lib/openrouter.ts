// OpenRouter API client for Hyperfocus AI

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Send a chat completion request to OpenRouter
 */
export async function sendChatCompletion(
  messages: Message[],
  model: string = DEFAULT_MODEL
): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://usehyperfocus.com',
        'X-Title': 'Hyperfocus AI',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}

/**
 * Detect if user is asking about diagrams/visualizations
 */
export function detectDiagramIntent(userMessage: string): boolean {
  const diagramKeywords = [
    'diagram', 'esquema', 'mind map', 'mindmap', 'mental',
    'visualize', 'visualiza', 'flowchart', 'flow chart',
    'chart', 'graph', 'draw', 'sketch', 'mermaid',
    'sequence', 'class diagram', 'gantt', 'timeline',
    'pie chart', 'quadrant', 'sankey', 'show me',
    'create a diagram', 'make a diagram', 'generate diagram'
  ];

  const lowerMessage = userMessage.toLowerCase();
  return diagramKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Get system prompt based on user intent
 */
export function getSystemPrompt(isDiagramRequest: boolean): string {
  if (isDiagramRequest) {
    return `You are an expert at creating Mermaid diagrams. When users request diagrams or visualizations, respond with valid Mermaid code in \`\`\`mermaid code blocks followed by a brief explanation.

Support these diagram types:
- flowchart/graph (process flows)
- mindmap (concepts and ideas)
- sequenceDiagram (interactions over time)
- classDiagram (class structures)
- gantt (timelines and schedules)
- pie (proportions)
- quadrantChart (2x2 matrices)
- sankey (flow quantities)

Always start the Mermaid code block clearly and end it before the explanation.`;
  }

  return `You are Hyperfocus AI, an AI assistant designed specifically to help neurodivergent individuals maximize their concentration and learning. 

Your core principles:
1. Be clear, concise, and structured in your responses
2. Break down complex topics into digestible chunks
3. Use formatting (bold, lists, headings) to improve readability
4. Stay focused on the current topic without going off on tangents
5. When explaining concepts, prioritize understanding over exhaustiveness

Always be supportive and patient. Remember that you're helping someone who may struggle with traditional learning methods.`;
}

/**
 * Analyze if two topics are similar
 */
export async function analyzeTopic(currentTopic: string, newMessage: string): Promise<{
  similarity: number;
  newTopic: string;
  isDifferentTopic: boolean;
}> {
  try {
    const prompt = `Analyze if these two topics are related or different:

Topic 1: "${currentTopic}"
Topic 2 (from new message): "${newMessage}"

Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{
  "similarity": <number 0-100>,
  "newTopic": "<brief topic description>",
  "isDifferentTopic": <true or false>
}`;

    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a topic analyzer. Respond ONLY with valid JSON, no other text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await sendChatCompletion(messages, DEFAULT_MODEL);
    
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      similarity: analysis.similarity,
      newTopic: analysis.newTopic,
      isDifferentTopic: analysis.isDifferentTopic,
    };
  } catch (error) {
    console.error('Error analyzing topic:', error);
    
    // Fallback: simple keyword matching
    const currentKeywords = currentTopic.toLowerCase().split(/\s+/);
    const newKeywords = newMessage.toLowerCase().split(/\s+/);
    
    const commonKeywords = currentKeywords.filter(keyword => 
      newKeywords.some(newKeyword => 
        newKeyword.includes(keyword) || keyword.includes(newKeyword)
      )
    );
    
    const similarity = (commonKeywords.length / Math.max(currentKeywords.length, newKeywords.length)) * 100;
    
    return {
      similarity,
      newTopic: newMessage.slice(0, 50),
      isDifferentTopic: similarity < 40,
    };
  }
}

/**
 * Extract the main topic from a message
 */
export async function extractTopic(message: string): Promise<string> {
  try {
    const prompt = `Extract the main topic or subject from this message in 3-5 words:

"${message}"

Respond with ONLY the topic phrase, nothing else.`;

    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a topic extractor. Respond with only the topic phrase.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const topic = await sendChatCompletion(messages, DEFAULT_MODEL);
    return topic.trim();
  } catch (error) {
    console.error('Error extracting topic:', error);
    
    // Fallback: use first 5 words
    const words = message.trim().split(/\s+/).slice(0, 5);
    return words.join(' ');
  }
}

/**
 * Analyze text and classify paragraphs into semantic chunks BY SECTIONS
 */
export async function analyzeSemanticChunks(text: string): Promise<Array<{
  type: 'definition' | 'example' | 'action' | 'keypoint' | 'explanation';
  content: string;
}>> {
  try {
    const prompt = `Analyze this text for a neurodivergent learning application. Separate it into semantic chunks BY SECTION (each title/heading = one chunk).

Text to analyze:
${text}

CRITICAL RULES:
1. Detect section titles/headings:
   - Numbered sections (1., 2., ##, etc.)
   - Bold or emphasized titles
   - Question-style headers (¿Qué es...?, What is...?)
   
2. Each section becomes ONE chunk containing:
   - The title/heading
   - ALL content under that section (complete, not summarized)
   
3. Classify each chunk by its title + content:
   - "definition": Sections about "Qué es", "Definición", "Concepto", "Introduction to"
   - "keypoint": Sections about "Características", "Principales", "Puntos clave", "Impacto", "Aspectos"
   - "example": Sections about "Ejemplos", "Casos", "Aplicaciones", "Prácticos"
   - "action": Sections about "Pasos", "Cómo", "Procedimiento", "Instrucciones"
   - "explanation": Other sections (Introducción, Contexto, Conclusión, Desafíos)

4. Keep FULL ORIGINAL CONTENT (don't shorten or summarize)
5. If no clear sections, separate by natural topic breaks
6. Minimum 2 chunks per response (never put everything as one "explanation")

EXAMPLE INPUT:
"## ¿Qué es la IA?
La inteligencia artificial es...

### Principales Características
- Automatización
- Aprendizaje

## Ejemplos Prácticos
1. Chatbots como ChatGPT
2. Vehículos autónomos"

EXAMPLE OUTPUT:
[
  {"type": "definition", "content": "¿Qué es la IA?\nLa inteligencia artificial es..."},
  {"type": "keypoint", "content": "Principales Características\n- Automatización\n- Aprendizaje"},
  {"type": "example", "content": "Ejemplos Prácticos\n1. Chatbots como ChatGPT\n2. Vehículos autónomos"}
]

Respond ONLY with JSON array (no \`\`\`, no markdown):`;

    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a semantic text analyzer. Separate text by sections/titles. Each section = one chunk. Keep full content. Respond ONLY with JSON array.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await sendChatCompletion(messages, 'anthropic/claude-3.7-haiku-20250219');
    
    // Try to extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON in response:', response);
      throw new Error('No valid JSON in response');
    }
    
    const chunks = JSON.parse(jsonMatch[0]);
    
    // Validate chunks
    if (!Array.isArray(chunks) || chunks.length === 0) {
      throw new Error('Invalid chunks format');
    }
    
    // If AI returned only one chunk with type "explanation", it failed - fallback
    if (chunks.length === 1 && chunks[0].type === 'explanation') {
      console.warn('AI returned single explanation chunk, text might not have clear sections');
    }
    
    return chunks;
  } catch (error) {
    console.error('Error analyzing semantic chunks:', error);
    
    // Fallback: return entire text as explanation
    return [{
      type: 'explanation',
      content: text,
    }];
  }
}

