// DiagramSidePanel - Panel lateral para diagramas (minimalista)
import { useState, useRef, useEffect } from 'react';
import { FiX, FiZoomIn, FiZoomOut, FiDownload, FiCode, FiEye, FiEdit3 } from 'react-icons/fi';
import mermaid from 'mermaid';

interface DiagramSidePanelProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
  onEditRequest: (instruction: string) => void;
}

export default function DiagramSidePanel({ code, isOpen, onClose, onEditRequest }: DiagramSidePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<'view' | 'code' | 'edit'>('view');
  const [editableCode, setEditableCode] = useState(code);
  const [codeToRender, setCodeToRender] = useState(code);
  const [editInstruction, setEditInstruction] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [showEditBox, setShowEditBox] = useState(false);

  // Update code when prop changes
  useEffect(() => {
    setCodeToRender(code);
    setEditableCode(code);
    setActiveTab('view'); // Reset to view when new diagram
    setShowEditBox(false);
  }, [code]);

  // Render diagram
  useEffect(() => {
    if (activeTab !== 'view' || !containerRef.current || isRendering || !isOpen) return;

    setIsRendering(true);
    setRenderError(null);

    const renderDiagram = async () => {
      try {
        const id = `mermaid-side-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        const { svg } = await mermaid.render(id, codeToRender);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = 'none';
            svgElement.style.height = 'auto';
          }
        }
            } catch (error) {
              console.error('Mermaid render error:', error);
              setRenderError('Invalid diagram syntax');
              if (containerRef.current) {
                containerRef.current.innerHTML = `
                  <div class="text-red-700 p-3 bg-red-50 rounded-lg text-sm border border-red-200 flex items-start gap-2">
                    <span class="text-red-500 text-lg">⚠️</span>
                    <div>
                      <div class="font-semibold">Invalid Mermaid syntax</div>
                      <div class="text-xs text-gray-600 mt-1">Check Code tab or ask AI to regenerate</div>
                    </div>
                  </div>
                `;
              }
            } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [codeToRender, activeTab, isOpen]);

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
      canvas.width = img.width * 2;
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
          a.download = 'diagram.png';
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
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyCode = () => {
    setCodeToRender(editableCode);
    setActiveTab('view');
  };

  const handleSendEditInstruction = () => {
    if (editInstruction.trim()) {
      onEditRequest(editInstruction);
      setEditInstruction('');
      setShowEditBox(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[600px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Diagram</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FiX className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-200">
        <button
          onClick={() => setActiveTab('view')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'view'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
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
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FiCode className="w-4 h-4" />
          Code
        </button>
        <button
          onClick={() => setShowEditBox(!showEditBox)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            showEditBox
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FiEdit3 className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Controls (solo para View) */}
      {activeTab === 'view' && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-gray-200"
              title="Zoom out"
            >
              <FiZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs font-medium hover:bg-gray-200 rounded min-w-[50px]"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-gray-200"
              title="Zoom in"
            >
              <FiZoomIn className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              className="px-2 py-1.5 text-xs font-medium hover:bg-gray-200 rounded flex items-center gap-1"
            >
              <FiDownload className="w-3 h-3" />
              PNG
            </button>
            <button
              onClick={handleDownloadSVG}
              className="px-2 py-1.5 text-xs font-medium hover:bg-gray-200 rounded flex items-center gap-1"
            >
              <FiDownload className="w-3 h-3" />
              SVG
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'view' && (
          <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center overflow-auto">
            <div
              ref={containerRef}
              className="transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center',
              }}
            />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="flex-1 bg-gray-900 p-4 overflow-auto flex flex-col">
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              className="flex-1 w-full bg-gray-900 text-gray-100 font-mono text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded resize-none"
              spellCheck={false}
            />
            <button
              onClick={handleApplyCode}
              className="mt-3 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Apply & View
            </button>
          </div>
        )}
      </div>

      {/* Edit Box (fijo abajo cuando está activo) */}
      {showEditBox && (
        <div className="border-t border-gray-200 bg-white p-4">
          <textarea
            value={editInstruction}
            onChange={(e) => setEditInstruction(e.target.value)}
            placeholder="Example: 'Add a new node called Programming'"
            className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setEditInstruction('')}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Clear
            </button>
            <button
              onClick={handleSendEditInstruction}
              disabled={!editInstruction.trim()}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Apply Changes
            </button>
          </div>
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
