// Main App component
import { useState, useEffect } from 'react';
import TopBar from './components/layout/TopBar';
import Sidebar from './components/layout/Sidebar';
import ChatContainer from './components/chat/ChatContainer';
import SettingsPanel from './components/settings/SettingsPanel';
import DiagramSidePanel from './components/diagrams/DiagramSidePanel';
import { useChat } from './hooks/useChat';
import { useHyperfocus } from './hooks/useHyperfocus';
import { cleanupMermaidErrors } from './lib/mermaid-config';

export default function App() {
  const [showSettings, setShowSettings] = useState(true); // Settings abierto por defecto
  const [diagramPanel, setDiagramPanel] = useState<{
    isOpen: boolean;
    code: string;
    messageId: string | null;
  }>({
    isOpen: false,
    code: '',
    messageId: null,
  });

  // Chat management
  const {
    chats,
    currentChat,
    currentChatId,
    isLoading,
    selectedModel,
    setSelectedModel,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    updateTopic,
  } = useChat();

  // Hyperfocus management
  const { checkFocus, isAnalyzing } = useHyperfocus(currentChat);

  // Clean up Mermaid errors periodically (CRITICAL: keeps UI clean)
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupMermaidErrors();
    }, 500); // Clean every 500ms

    return () => clearInterval(interval);
  }, []);

  // Handler for closing diagram panel
  const handleCloseDiagram = () => {
    setDiagramPanel({
      isOpen: false,
      code: '',
      messageId: null,
    });
  };

  // Close diagram panel when changing chats
  useEffect(() => {
    handleCloseDiagram();
  }, [currentChatId]);

  // Handler for sending messages
  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  // Handler for creating new chat
  const handleNewChat = () => {
    createNewChat();
  };

  // Handler for opening diagram panel
  const handleOpenDiagram = (code: string, messageId: string) => {
    setDiagramPanel({
      isOpen: true,
      code,
      messageId,
    });
  };

  // Handler for editing diagram with natural language
  const handleEditDiagram = async (instruction: string) => {
    if (!diagramPanel.messageId || !currentChat) return;

    const editMessage = `EDIT DIAGRAM REQUEST: ${instruction}

Current diagram:
\`\`\`mermaid
${diagramPanel.code}
\`\`\`

RESPOND WITH ONLY:
\`\`\`mermaid
[updated code]
\`\`\`

NO TEXT BEFORE OR AFTER THE CODE BLOCK.`;
    
    await sendMessage(editMessage);
    setDiagramPanel({ ...diagramPanel, isOpen: false }); // Close panel to see new response
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Top bar */}
      <TopBar onSettingsClick={() => setShowSettings(!showSettings)} />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
        />

        {/* Chat container */}
        <div 
          className="flex-1 flex flex-col transition-all duration-300"
          style={{
            marginRight: showSettings ? '320px' : '0',
          }}
        >
          <ChatContainer
            currentChat={currentChat}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onUpdateTopic={updateTopic}
            onNewChat={handleNewChat}
            checkFocus={checkFocus}
            isAnalyzing={isAnalyzing}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onOpenDiagram={handleOpenDiagram}
          />
        </div>

        {/* Settings panel - fixed right, always visible */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Diagram side panel */}
        <DiagramSidePanel
          code={diagramPanel.code}
          isOpen={diagramPanel.isOpen}
          onClose={handleCloseDiagram}
          onEditRequest={handleEditDiagram}
        />
      </div>
    </div>
  );
}

