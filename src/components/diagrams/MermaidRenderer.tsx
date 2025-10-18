// MermaidRenderer component - Renders Mermaid diagrams inline with controls
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { FiZoomIn, FiZoomOut, FiDownload, FiCode, FiEye } from 'react-icons/fi';

// Initialize Mermaid once with improved configuration for neurodivergent users
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: 20, // Increased from 18 to 20
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
    fontSize: '20px', // Increased
    fontFamily: 'Inter, system-ui, sans-serif',
    primaryColor: '#e0f2fe',
    primaryTextColor: '#0c4a6e',
    primaryBorderColor: '#0ea5e9',
    lineColor: '#64748b',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#fef3c7',
  },
});

interface MermaidRendererProps {
  code: string;
}

export default function MermaidRenderer({ code }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<'view' | 'code'>('view');
  const [editableCode, setEditableCode] = useState(code);
  const [codeToRender, setCodeToRender] = useState(code);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Update code when prop changes
  useEffect(() => {
    setCodeToRender(code);
    setEditableCode(code);
  }, [code]);

  // Render diagram
  useEffect(() => {
    if (activeTab !== 'view' || !containerRef.current || isRendering) return;

    setIsRendering(true);
    setRenderError(null);

    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Render
        const { svg } = await mermaid.render(id, codeToRender);

        // Insert SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          
          // Apply zoom to SVG
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = 'none';
            svgElement.style.height = 'auto';
          }
        }
      } catch (error) {
        console.error('Mermaid render error:', error);
        setRenderError('Failed to render diagram. Please check the code syntax.');
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="text-red-600 p-6 bg-red-50 rounded-lg">
              <strong>Error rendering diagram:</strong><br/>
              ${error instanceof Error ? error.message : 'Unknown error'}
            </div>
          `;
        }
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [codeToRender, activeTab]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const handleDownloadPNG = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width * 2; // Higher resolution
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'hyperfocus-diagram.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleDownloadSVG = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hyperfocus-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyCode = () => {
    setCodeToRender(editableCode);
    setActiveTab('view');
  };

  const handleCancelEdit = () => {
    setEditableCode(codeToRender);
    setActiveTab('view');
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header with tabs and controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'view'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FiEye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'code'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FiCode className="w-4 h-4" />
            Code
          </button>
        </div>

        {/* Controls */}
        {activeTab === 'view' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Zoom out"
            >
              <FiZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs font-medium hover:bg-gray-200 rounded transition-colors min-w-[50px]"
              title="Reset zoom"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Zoom in"
            >
              <FiZoomIn className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <button
              onClick={handleDownloadPNG}
              className="px-2 py-1.5 text-xs font-medium hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
              title="Download PNG"
            >
              <FiDownload className="w-3 h-3" />
              PNG
            </button>
            <button
              onClick={handleDownloadSVG}
              className="px-2 py-1.5 text-xs font-medium hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
              title="Download SVG"
            >
              <FiDownload className="w-3 h-3" />
              SVG
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCode}
              className="px-3 py-1.5 text-sm font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Apply & View
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'view' ? (
        <div className="p-6 bg-gray-50 flex items-center justify-center overflow-auto" style={{ minHeight: '400px', maxHeight: '600px' }}>
          <div
            ref={containerRef}
            className="transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center',
            }}
          />
        </div>
      ) : (
        <div className="bg-gray-900 p-4">
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            className="w-full h-96 bg-gray-900 text-gray-100 font-mono text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded resize-none"
            spellCheck={false}
          />
        </div>
      )}

      {/* Error message */}
      {renderError && activeTab === 'view' && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-sm text-red-700">
          {renderError}
        </div>
      )}
    </div>
  );
}
