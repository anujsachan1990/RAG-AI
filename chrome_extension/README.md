# HESTA AI Chrome Extension

This folder contains a standalone Chrome extension that adds an AI-powered chat sidebar to hesta.com.au.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right corner)
3. Click "Load unpacked"
4. Select this `chrome_extension` folder
5. Visit hesta.com.au to see the extension in action

## Features

- **Floating Toggle Button**: Draggable button appears on hesta.com.au pages
- **Sidebar Chat**: 500px wide sidebar with AI assistant
- **Smooth Animations**: Page content slides left when sidebar opens
- **Close Button**: Click X to close the sidebar

## Files Structure

\`\`\`
chrome_extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content-script.js      # Injects sidebar and toggle button
├── sidebar.html           # Sidebar iframe container
├── sidebar.css            # Sidebar styles
├── icon.svg               # Vector icon
├── icon-16.jpg            # 16x16 icon
├── icon-32.jpg            # 32x32 icon
├── icon-48.jpg            # 48x48 icon
└── icon-128.jpg           # 128x128 icon
\`\`\`

## Configuration

To customize the extension, edit these values in the files:

### Change the App URL
In `sidebar.html`, update the iframe src:
\`\`\`html
<iframe src="https://your-app-url.vercel.app"></iframe>
\`\`\`

### Change the Domain
In `manifest.json`, update the host permissions:
\`\`\`json
"host_permissions": ["*://yourdomain.com/*"]
\`\`\`

### Adjust Sidebar Width
In `content-script.js`, change the width value:
\`\`\`javascript
const SIDEBAR_WIDTH = '500px'; // Change to your preferred width
\`\`\`

### Customize Colors
In `content-script.js`, modify the toggle button styles:
\`\`\`javascript
background: '#7c3aed', // Primary color
\`\`\`

## Troubleshooting

**Extension not appearing:**
- Make sure you're on hesta.com.au (or your configured domain)
- Check that the extension is enabled in chrome://extensions/

**Sidebar shows "refused to connect":**
- Verify your Next.js app is deployed and accessible
- Check that iframe embedding is allowed (see main README.md)

**Toggle button not working:**
- Open DevTools Console (F12) to check for errors
- Reload the extension from chrome://extensions/

## Uninstall

1. Go to `chrome://extensions/`
2. Find "HESTA AI Assistant"
3. Click "Remove"
\`\`\`

```json file="chrome-extension-manifest.json" isDeleted="true"
...deleted...
