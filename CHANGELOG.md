# Changelog - Hyperfocus AI

## Version 0.2.0 - Bug Fixes & Major UI Improvements (October 17, 2025)

### 🐛 Bug Fixes

#### 1. **Settings Bug Fixed**
- **Problem**: When changing settings, the text being typed in the input was deleted
- **Solution**: Removed `window.location.reload()` from settings save - changes now apply without reloading
- **File**: `src/components/settings/SettingsPanel.tsx`

#### 2. **Chunks Persistence**
- **Problem**: Semantic chunks were not persisting between chat sessions
- **Solution**: 
  - Added `semanticChunks` field to Message type
  - Chunks are now saved in message data
  - Chunks load from storage instead of re-analyzing each time
- **Files**: `src/types/index.ts`, `src/components/chat/Message.tsx`

### 🎨 UI/UX Improvements

#### 3. **Diagram Visualization Redesign**
- **Changes**:
  - ✅ Removed "Expand Diagram" button
  - ✅ Diagrams now display large inline by default
  - ✅ View/Code tabs integrated directly in the diagram card
  - ✅ Zoom controls (Zoom In/Out/Reset with percentage display)
  - ✅ Download buttons (PNG/SVG) always visible
  - ✅ Proper sizing based on diagram complexity
- **File**: `src/components/diagrams/MermaidRenderer.tsx`
- **Deleted**: `src/components/diagrams/ExpandedDiagramView.tsx` (no longer needed)

#### 4. **Mind Maps Font Size Improvement**
- **Changes**:
  - Increased base font size from 18px to 20px
  - Increased padding and spacing in mind maps
  - Better node width (300px max)
  - Improved spacing between nodes (100px)
  - Enhanced theme variables for better contrast
- **File**: `src/components/diagrams/MermaidRenderer.tsx`

#### 5. **Settings Panel Redesign (Gemini Style)**
- **Changes**:
  - ✅ Converted from modal to permanent sidebar
  - ✅ Slides from right side (not translucent overlay)
  - ✅ Subtle backdrop (10% opacity) when open
  - ✅ Smooth animations (300ms transition)
  - ✅ Width: 320px when open, 0px when closed
  - ✅ Modern card-based option selection
  - ✅ No page reload when saving settings
- **File**: `src/components/settings/SettingsPanel.tsx`

### ⚡ Performance Improvements

#### 6. **Chunks Analysis Model Change**
- **Changes**:
  - Changed from `anthropic/claude-3.5-sonnet` to `anthropic/claude-3.5-haiku`
  - Faster analysis with more concise summaries
  - Updated prompt to request brief, summarized content instead of full text
- **File**: `src/lib/openrouter.ts`

### ✨ New Features

#### 7. **AI Model Selector**
- **Features**:
  - ✅ Dropdown selector in chat input area
  - ✅ Provider icons (OpenAI, Anthropic, Google, xAI, Perplexity)
  - ✅ Model descriptions shown on hover
  - ✅ Active model indicator
  - ✅ Smooth dropdown animation
- **Available Models**:
  1. **GPT-4o Mini** (OpenAI) - Fast and efficient
  2. **Gemini 2.5 Flash** (Google) - Multimodal AI
  3. **Grok 4 Fast** (xAI) - Fast reasoning
  4. **Claude 3.5 Sonnet** (Anthropic) - Balanced
  5. **Claude 3.5 Haiku** (Anthropic) - Fast & efficient
  6. **Sonar Deep Research** (Perplexity) - Research-focused
- **Files**: 
  - `src/lib/aiModels.ts` (new)
  - `src/components/chat/ModelSelector.tsx` (new)
  - `src/hooks/useChat.ts` (updated)
  - `src/components/chat/ChatInput.tsx` (updated)
  - `src/components/chat/ChatContainer.tsx` (updated)
  - `src/App.tsx` (updated)

### 📦 Dependencies

#### 8. **New Package**
- Added `@lobehub/icons` for AI provider icons
- Includes OpenAI, Anthropic, Google, xAI, Perplexity icons

### 🔧 Technical Details

**Files Modified**: 11
**Files Created**: 3
**Files Deleted**: 1

**Breaking Changes**: None

**Migration Required**: No

### 📝 Notes

- Settings changes now apply instantly without losing typed text
- Diagrams are more readable with larger fonts and better spacing
- Chunks persist across sessions, improving performance
- Model selection allows users to choose the best AI for their needs
- All changes maintain backward compatibility with existing data

### 🎯 User Experience Impact

1. **No more frustration** from losing typed text when adjusting settings
2. **Better readability** of mind maps and diagrams
3. **Faster chunk analysis** with Haiku model
4. **More control** over AI model selection
5. **Modern UI** matching Google AI Studio's design patterns


