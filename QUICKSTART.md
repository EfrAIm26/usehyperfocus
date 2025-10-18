# 🚀 Quick Start Guide - Hyperfocus AI

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This will install all necessary packages including:
- React 19.1.1
- TypeScript
- Vite 7.1.7
- Tailwind CSS 4.1.14
- Mermaid.js 11.12.0
- React Markdown
- React Icons

## Step 2: Verify Environment Variables

The `.env.local` file should already be configured with your OpenRouter API key. If not, create it:

```
VITE_OPENROUTER_API_KEY=your_key_here
```

## Step 3: Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Step 4: Start Using Hyperfocus AI

1. **Create Your First Chat**
   - Click the green "New Chat" button in the sidebar
   
2. **Ask a Question**
   - Type any question or topic you want to learn about
   - Press Enter to send
   
3. **Experience Hyperfocus Mode**
   - The app will track your current topic
   - Try asking about something completely different
   - See the Hyperfocus alert in action!
   
4. **Try Creating Diagrams**
   - Ask: "Create a mind map about Python programming"
   - Ask: "Show me a flowchart of how HTTP works"
   - Ask: "Visualize the solar system as a diagram"
   
5. **Customize Your Experience**
   - Click the settings icon (⚙️) in the top right
   - Try different reading styles
   - Adjust Hyperfocus sensitivity

## 🎯 Example Prompts to Try

**General Learning:**
- "Explain quantum computing in simple terms"
- "What is machine learning and how does it work?"
- "Teach me about photosynthesis"

**With Diagrams:**
- "Create a mind map about artificial intelligence concepts"
- "Show me a flowchart of the software development lifecycle"
- "Make a diagram of how a car engine works"

**Testing Hyperfocus:**
1. Ask: "Explain how photosynthesis works"
2. Wait for response
3. Ask: "What is machine learning?" (completely different topic)
4. See the Hyperfocus alert!

## ⚙️ Settings to Explore

**Reading Styles:**
- **Fast Reading (Bionic)** - Default, makes reading faster
- **OpenDyslexic** - Special font for dyslexia
- **Normal** - Standard text

**Hyperfocus Mode:**
- **Enable/Disable** - Turn the focus feature on/off
- **Minimum Messages** - How many messages before topic switching is allowed
- **Similarity Threshold** - How strict the topic detection is

## 🐛 Troubleshooting

**App won't start?**
- Make sure Node.js 18+ is installed
- Run `npm install` again
- Check that port 5173 is available

**API errors?**
- Verify your OpenRouter API key in `.env.local`
- Check your internet connection
- Make sure the API key is valid

**Diagrams not showing?**
- Check browser console for errors
- Try refreshing the page
- Make sure your diagram syntax is correct

## 📚 Learn More

- Check `README.md` for full documentation
- Explore the `src/` folder to see the code structure
- Modify settings to customize your experience

## 🎉 You're Ready!

Start chatting and experience focus like never before!

---

Need help? Check the README.md or open an issue.


