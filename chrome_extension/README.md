# HESTA AI Chrome Extension

A Chrome extension that provides instant access to the HESTA AI assistant directly from your browser.

## Features

- 🤖 **AI-Powered Chat**: Ask questions about HESTA superannuation, retirement planning, and investments
- 🔍 **RAG Support**: Toggle between RAG-powered responses (with vector search) and direct LLM responses
- 💾 **Conversation History**: Your chats are saved locally and persist across sessions
- ⚙️ **Configurable**: Set custom API endpoint for local development or production
- 🎨 **Beautiful UI**: Gradient purple design matching the HESTA brand

## Installation

### Development Mode

1. **Build the Extension** (files are already in `chrome_extension/` folder)

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `chrome_extension` folder from your project

3. **Start Your API Server**:
   \`\`\`bash
   npm run dev
   # Server should be running at http://localhost:3000
   \`\`\`

4. **Use the Extension**:
   - Click the HESTA AI icon in your Chrome toolbar
   - The popup will open with the chat interface
   - Start chatting!

## Configuration

Click the settings icon (gear) in the extension popup to configure:

- **API Endpoint**: Set to your API server URL
  - Local: `http://localhost:3000`
  - Production: Your deployed Vercel URL
  
- **Enable RAG**: Toggle RAG (Retrieval-Augmented Generation) on/off
  - When ON: Uses vector search to find relevant HESTA content
  - When OFF: Uses LLM general knowledge only

## File Structure

\`\`\`
chrome_extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html            # Main popup UI
├── popup.js              # Popup logic and API communication
├── styles.css            # Styling for the popup
├── background.js         # Background service worker
├── icons/                # Extension icons (16, 32, 48, 128px)
└── README.md            # This file
\`\`\`

## Adding Icons

Replace the placeholder icon paths in `manifest.json` with actual icon files:

1. Create icons at these sizes: 16x16, 32x32, 48x48, 128x128
2. Save them in the `chrome_extension/icons/` folder
3. Name them: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

## Publishing to Chrome Web Store

1. **Prepare for production**:
   - Update `apiEndpoint` default to your production URL in `popup.js`
   - Add proper icons
   - Test thoroughly

2. **Create a ZIP file**:
   \`\`\`bash
   cd chrome_extension
   zip -r hesta-ai-extension.zip .
   \`\`\`

3. **Upload to Chrome Web Store**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay one-time $5 developer fee (if first time)
   - Upload the ZIP file
   - Fill in store listing details
   - Submit for review

## Troubleshooting

**Extension not connecting to API?**
- Check that your API server is running
- Verify the API endpoint in settings matches your server URL
- Check browser console for CORS errors (you may need to update CORS settings in your Next.js API)

**No conversation history?**
- History is stored in Chrome's local storage
- Clear extension data: Chrome Settings → Privacy → Site Settings → View permissions → Chrome Extensions → HESTA AI → Clear data

**API returns errors?**
- Ensure `ENABLE_RAG` environment variable matches your toggle setting
- Check that all required environment variables are set in your API server
- Verify Upstash Vector credentials if using RAG mode

## Development

To modify the extension:

1. Edit files in `chrome_extension/` folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the HESTA AI extension card
4. Test your changes in the popup

## License

Same as parent project.
