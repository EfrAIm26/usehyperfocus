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
import { sendChatCompletion, getSystemPrompt } from './lib/openrouter';
import { extractContent } from './lib/utils';
import { storage } from './lib/storage';

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

    try {
      // Create edit prompt
      const editPrompt = `EDIT DIAGRAM: ${instruction}

Current diagram:
\`\`\`mermaid
${diagramPanel.code}
\`\`\`

RULES:
1. Keep same diagram type
2. Apply ONLY requested change
3. Respond with VALID Mermaid code ONLY
4. Wrap in \`\`\`mermaid code block
5. NO explanations`;

      // Call API directly WITHOUT saving to chat (use selected model)
      const apiResponse = await sendChatCompletion([
        { role: 'system', content: getSystemPrompt(true) },
        { role: 'user', content: editPrompt }
      ], selectedModel);

      // Extract new Mermaid code
      const { mermaidCode } = extractContent(apiResponse);

      if (mermaidCode) {
        // Get all chats and find current one
        const allChats = storage.getChats();
        const chatToUpdate = allChats.find(c => c.id === currentChat.id);
        
        if (chatToUpdate) {
          // Update the specific message with new Mermaid code
          const updatedChat = {
            ...chatToUpdate,
            messages: chatToUpdate.messages.map(msg =>
              msg.id === diagramPanel.messageId
                ? { ...msg, mermaidCode }
                : msg
            ),
            updatedAt: Date.now(),
          };

          // Save to storage
          storage.saveChat(updatedChat);

          // Update diagram panel with new code (triggers auto-render)
          setDiagramPanel({
            ...diagramPanel,
            code: mermaidCode,
          });
          
          // Force page reload to reflect changes
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error editing diagram:', error);
      alert('Error editing diagram. Please try again.');
    }
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

