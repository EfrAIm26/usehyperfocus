// SemanticChunk component - Renders color-coded semantic sections
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiSun, FiBookOpen, FiCheckCircle, FiSearch, FiEdit3 } from 'react-icons/fi';
import type { ChunkType, FontStyle } from '../../types';

interface SemanticChunkProps {
  type: ChunkType;
  content: string;
  fontStyle: FontStyle;
}

const CHUNK_CONFIG = {
  definition: {
    color: 'var(--chunk-definition)',
    icon: FiSun,
    iconColor: 'text-yellow-600',
    label: 'Definition',
  },
  example: {
    color: 'var(--chunk-example)',
    icon: FiBookOpen,
    iconColor: 'text-blue-600',
    label: 'Example',
  },
  action: {
    color: 'var(--chunk-action)',
    icon: FiCheckCircle,
    iconColor: 'text-green-600',
    label: 'Action',
  },
  keypoint: {
    color: 'var(--chunk-keypoint)',
    icon: FiSearch,
    iconColor: 'text-purple-600',
    label: 'Key Point',
  },
  explanation: {
    color: 'var(--chunk-explanation)',
    icon: FiEdit3,
    iconColor: 'text-gray-600',
    label: 'Explanation',
  },
};

export default function SemanticChunk({ type, content, fontStyle }: SemanticChunkProps) {
  const config = CHUNK_CONFIG[type];
  const Icon = config.icon;

  const getFontClass = () => {
    switch (fontStyle) {
      case 'dyslexic':
        return 'font-dyslexic';
      case 'lexend':
        return 'font-lexend';
      case 'normal':
      case 'bionic':
      default:
        return 'font-sans';
    }
  };

  // Apply bionic reading if enabled
  const processBionicText = (text: string) => {
    if (fontStyle !== 'bionic') return text;

    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      if (/^\s+$/.test(word) || word.length <= 1) {
        return <span key={index}>{word}</span>;
      }

      let boldLength = 1;
      if (word.length >= 2 && word.length <= 3) {
        boldLength = 1;
      } else if (word.length >= 4 && word.length <= 5) {
        boldLength = Math.ceil(word.length * 0.5);
      } else if (word.length >= 6 && word.length <= 8) {
        boldLength = Math.ceil(word.length * 0.4);
      } else if (word.length >= 9) {
        boldLength = Math.ceil(word.length * 0.35);
      }

      const boldPart = word.slice(0, boldLength);
      const normalPart = word.slice(boldLength);

      return (
        <span key={index}>
          <strong>{boldPart}</strong>
          {normalPart}
        </span>
      );
    });
  };

  return (
    <div
      className="group relative rounded-xl p-5 mb-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-transparent hover:border-gray-200"
      style={{ backgroundColor: config.color }}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className={`p-2 rounded-lg bg-white/60 ${config.iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 ${getFontClass()}`}>
          {/* Label - only visible on hover */}
          <div className="text-xs font-semibold uppercase text-gray-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {config.label}
          </div>

          {/* Text content with markdown */}
          {fontStyle === 'bionic' ? (
            <div className="prose prose-sm max-w-none">
              {processBionicText(content)}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-3 text-left leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-text-primary">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => <li className="text-left">{children}</li>,
                  code: ({ className, children }: any) => {
                    const isInline = !className || !className.includes('language-');
                    if (isInline) {
                      return (
                        <code className="px-1.5 py-0.5 bg-gray-200 text-pink-600 rounded text-sm font-mono">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="block p-3 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono overflow-x-auto my-2">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <pre className="my-2">{children}</pre>,
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mb-2 mt-2">{children}</h3>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

