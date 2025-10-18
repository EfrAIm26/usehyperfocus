# 🧠 Hyperfocus AI

> Empowering the way your brain works best

An AI-powered chat application designed specifically for neurodivergent individuals to maximize concentration, learning, and productivity.

## 🎯 Features

### 🎯 **Hyperfocus Mode**
- AI-driven topic detection keeps you focused on one subject
- Gentle alerts when you're drifting off-topic
- Stay productive without distractions

### 📊 **Semantic Chunking (Chuck Mode)**
- Content automatically organized into digestible segments
- Color-coded by type: Definition, Examples, Key Points, Actions, Explanations
- Perfect for neurodivergent learning styles

### 👁️ **Fast Reading (Bionic Reading)**
- Multiple font styles: Bionic, Dyslexic-friendly, Lexend, Normal
- Enhanced readability for various learning needs
- Improves comprehension and reduces cognitive load

### 🗺️ **Mind Maps & Diagrams**
- Ask for diagrams and mind maps in natural language
- Powered by Mermaid.js for beautiful visualizations
- Edit diagrams with natural language instructions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key ([get one here](https://openrouter.ai))

### Local Development

```bash
# Install dependencies
npm install

# Create .env.local
echo "VITE_OPENROUTER_API_KEY=your_api_key_here" > .env.local

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## 📦 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/usehyperfocus.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Add Environment Variables in Vercel**
   - Go to Settings → Environment Variables
   - Add `VITE_OPENROUTER_API_KEY` with your API key

See [INICIO_GITHUB_VERCEL.md](./INICIO_GITHUB_VERCEL.md) for detailed instructions.

### Supabase (Phase 2)

For now, we're using localStorage. Supabase integration is planned for Phase 2.

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── chat/           # Chat UI components
│   ├── diagrams/       # Mermaid diagram rendering
│   ├── layout/         # Page layout
│   └── settings/       # Settings panel
├── hooks/              # Custom React hooks
│   ├── useChat.ts      # Chat management
│   ├── useHyperfocus.ts # Hyperfocus mode
│   └── useFastReading.ts # Bionic reading
├── lib/                # Utilities
│   ├── openrouter.ts   # API client
│   ├── storage.ts      # localStorage manager
│   └── utils.ts        # Helpers
├── types/              # TypeScript types
└── App.tsx            # Main app component
```

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1 + TypeScript
- **Build**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.14
- **API**: OpenRouter (Claude, GPT-4, Grok, etc.)
- **Diagrams**: Mermaid.js 11.12.0
- **Storage**: localStorage (Supabase coming soon)
- **Icons**: @lobehub/icons

## 📝 Usage

### Basic Chat
1. Type your question or topic
2. Select an AI model from the dropdown
3. Press Enter or click Send

### Enable Semantic Chunking
1. Click the **"+"** button (left of input)
2. Toggle **"Semantic Chunks"**
3. Response will be color-coded by type

### Change Font Style
1. Click the **"+"** button
2. Select from: Bionic, Dyslexic, Lexend, Normal
3. Applies to new messages (old ones keep their style)

### Request Diagrams
1. Ask for a diagram: "Create a mind map of...", "Draw a flowchart of..."
2. Diagram appears in a side panel
3. Use zoom controls and download options
4. Edit with natural language: "Add a node called..."

### Hyperfocus Mode
1. Open Settings (⚙️ icon)
2. Toggle "Hyperfocus Mode"
3. First message sets the topic
4. AI warns if you drift off-topic
5. Choose: Continue on topic or start new chat

## 🧪 Testing & Verification

Before deploying:

```bash
# Check TypeScript errors
npx tsc --noEmit

# Build for production
npm run build

# Run dev server
npm run dev
```

## 📊 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## ⚠️ Known Limitations (Phase 1)

- ❌ File uploads not yet supported (Attach button is placeholder)
- ❌ No authentication (localStorage only)
- ❌ No backend persistence (Phase 2 with Supabase)
- ❌ Single device usage

## 🗺️ Roadmap

### Phase 2
- [ ] Supabase integration (user accounts, cloud storage)
- [ ] File uploads and processing
- [ ] Real-time collaboration
- [ ] Advanced analytics

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Custom AI model training
- [ ] Plugin system

## 🤝 Contributing

This is an MVP. Contributions welcome! For major changes, please open an issue first.

## 📄 License

MIT

## 👥 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issues](https://github.com/YOUR_USERNAME/usehyperfocus/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/usehyperfocus/discussions)

---

**Built with ❤️ for neurodivergent learners**

