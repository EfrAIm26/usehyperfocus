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
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Send a chat completion request to OpenRouter
 */
export async function sendChatCompletion(
  messages: Message[],
  model: string = DEFAULT_MODEL
): Promise<string> {
  if (!API_KEY || API_KEY === 'undefined') {
    throw new Error('API key not configured');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://usehyperfocus.vercel.app',
        'X-Title': 'Hyperfocus AI',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data: OpenRouterResponse = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || response.statusText;
      console.error('OpenRouter Error:', { status: response.status, error: data.error, model });
      throw new Error(`AI Error (${response.status}): ${errorMsg}`);
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty AI response');
    }

    return content;
  } catch (error) {
    console.error('OpenRouter API failed:', error);
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
    'create a diagram', 'make a diagram', 'generate diagram',
    'mapa mental', 'hacer un mapa', 'hazme un', 'dame un',
    'crea un diagrama', 'dibuja', 'visualiza', 'muestra',
    'gráfico', 'organigrama', 'línea de tiempo'
  ];

  const lowerMessage = userMessage.toLowerCase();
  return diagramKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Get system prompt based on user intent
 */
export function getSystemPrompt(isDiagramRequest: boolean): string {
  if (isDiagramRequest) {
    return `You are a Mermaid diagram expert. Generate ONLY valid, tested Mermaid code.

MANDATORY FORMAT:
\`\`\`mermaid
[your code here]
\`\`\`

VALID SYNTAXES:

**MINDMAP** (use for concepts/topics):
\`\`\`mermaid
mindmap
  root((Main Topic))
    SubTopic1
      Detail1
      Detail2
    SubTopic2
      Detail3
\`\`\`

**FLOWCHART** (use for processes):
\`\`\`mermaid
flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action1]
    B -->|No| D[Action2]
\`\`\`

**ABSOLUTE RULES:**
1. ALWAYS start with diagram type (mindmap, flowchart, etc.)
2. Use 2-space indentation
3. NO tabs
4. Close ALL parentheses
5. Test code is valid before responding
6. Keep it SIMPLE - max 10 nodes
7. Add SHORT explanation AFTER code block (1-2 sentences)

RESPOND FORMAT:
\`\`\`mermaid
[code]
\`\`\`

Brief explanation.`;
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

        const response = await sendChatCompletion(messages, 'anthropic/claude-haiku-4.5');
    
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

/**
 * Check if user message is related to the focus task (Hyperfocus mode)
 * Returns true if message is ON-TOPIC, false if it's a DISTRACTION
 */
export async function checkTaskRelevance(
  userMessage: string,
  focusTask: string
): Promise<{ isRelevant: boolean; confidence: number }> {
  try {
    const prompt = `You are helping a user stay focused on their task. Analyze if the user's message is related to their focus task.

FOCUS TASK: "${focusTask}"

USER MESSAGE: "${userMessage}"

Determine if the message is:
- RELEVANT (ON-TOPIC): Directly related to the focus task, asking questions about it, working on it, or discussing related concepts
- DISTRACTION (OFF-TOPIC): Completely unrelated, about different topics, or trying to change subject

Respond ONLY with JSON (no markdown, no backticks):
{
  "isRelevant": true/false,
  "confidence": 0-100,
  "reason": "brief explanation"
}`;

    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a focus assistant. Analyze if messages are related to the user\'s task. Respond ONLY with JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await sendChatCompletion(messages, 'anthropic/claude-haiku-4.5');
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON in relevance check response:', response);
      return { isRelevant: true, confidence: 50 }; // Default to allowing message
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    return {
      isRelevant: result.isRelevant ?? true,
      confidence: result.confidence ?? 50,
    };
  } catch (error) {
    console.error('Error checking task relevance:', error);
    // On error, default to allowing the message (don't block user)
    return { isRelevant: true, confidence: 50 };
  }
}

