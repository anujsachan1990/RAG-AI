# Chrome Extension Setup Guide

This guide will help you install and use the AI Assistant as a Chrome extension that appears as a sidebar on your target domain.

## Prerequisites

1. Deploy your Next.js app to Vercel or another hosting platform
2. Get your deployed app URL (e.g., `https://your-app.vercel.app`)

## Installation Steps

### Step 1: Prepare Extension Files

1. Download the project as a ZIP file from v0
2. Extract to a folder on your computer
3. **Important:** Rename `chrome-extension-manifest.json` to `manifest.json`
   - This is the Chrome extension manifest (separate from the web app PWA manifest in `/public`)

### Step 2: Update Configuration

1. Open `sidebar.html` in the root directory
2. Find the line with the iframe src
3. Replace with your actual deployed app URL:

\`\`\`html
<iframe src="https://v0-generative-ui-poc-rag.vercel.app" ...>
\`\`\`

### Step 3: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select your project root folder (containing the renamed `manifest.json`)
5. The extension should now appear in your extensions list

### Step 4: Use the Extension

1. Navigate to hesta.com.au
2. You'll see a draggable floating button in the bottom right corner
3. Click the button to toggle the AI assistant sidebar
4. The website content will slide to the left, and the sidebar will appear (500px wide)
5. Click the X button in the top right of the sidebar to close it

**Note:** All required files are now at the root level:
- `manifest.json`
- `content-script.js`
- `background.js`
- `sidebar.html`
- `sidebar.css`
- Icon files (`icon-16.png`, etc.)

### Step 5: Customize Extension

#### Change Target Domain

To use on a different domain, edit `manifest.json`:

\`\`\`json
{
  "host_permissions": ["https://yourdomain.com/*", "https://*.yourdomain.com/*"],
  "content_scripts": [
    {
      "matches": ["https://yourdomain.com/*", "https://*.yourdomain.com/*"],
      ...
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["sidebar.html", "*.js", "*.css", "*.svg", "*.png"],
      "matches": ["https://yourdomain.com/*", "https://*.yourdomain.com/*"]
    }
  ]
}
\`\`\`

#### Change Sidebar Width

Edit `content-script.js` and update both width values:

\`\`\`javascript
// Change 500px to desired width
sidebarContainer.style.cssText = `
  width: 500px;  // <-- Change this
  right: -500px; // <-- And this (same value but negative)
  ...
`;

// Also update the slide amount
document.body.style.marginRight = '500px';  // <-- And this

// Update toggle button position
toggleButton.style.right = '520px'; // width + 20px spacing
\`\`\`

#### Customize Toggle Button

Edit `content-script.js` to change button appearance:

\`\`\`javascript
toggleButton.style.cssText = `
  bottom: 20px;           // Vertical position
  right: 20px;            // Horizontal position
  background: #2563eb;    // Background color
  ...
`;
\`\`\`

#### Custom Icons

Replace the icon files with your own brand icons:
- `icon-16.png` - 16x16px (toolbar icon)
- `icon-32.png` - 32x32px (toolbar icon retina)
- `icon-48.png` - 48x48px (extension management)
- `icon-128.png` - 128x128px (Chrome Web Store)

You can use the `icon.svg` as a template and export to PNG at different sizes.

## Local Development

For local development with the extension:

1. In `sidebar.html`, temporarily set the iframe src to localhost:
\`\`\`html
<iframe src="http://localhost:3000" ...>
\`\`\`

2. Run your Next.js app locally:
\`\`\`bash
npm run dev
\`\`\`

3. Click "Reload" on the extension in `chrome://extensions/`
4. The sidebar will now load from your local development server

**Remember to change back to your production URL before publishing!**

## Troubleshooting

### Extension Not Loading
- Check that `manifest.json` is in the root folder
- Verify all files referenced in manifest exist
- Check Chrome DevTools Extensions console for errors
- Try removing and re-adding the extension

### Sidebar Not Appearing
- Make sure you're on the correct domain specified in `manifest.json`
- Check browser console for JavaScript errors
- Verify the content script is loading (DevTools > Sources tab)
- Ensure the domain matches exactly (including https/http)

### Sidebar is Blank
- Verify the deployed app URL in `sidebar.html` is correct
- Check if your app allows iframe embedding
- Look for CORS errors in browser console
- Test the URL directly in a browser first

### Toggle Button Doesn't Work
- Open browser console and look for errors
- Check if content-script.js loaded properly
- Verify no conflicting extensions are interfering
- Try disabling other extensions temporarily

### Website Layout Breaks
- Some websites have fixed positioning that conflicts
- Try adjusting the margin application in `content-script.js`
- Consider targeting specific containers instead of `<body>`
- Test on different pages of the target site

## Publishing to Chrome Web Store

To publish your extension publicly:

1. Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/) ($5 one-time fee)

2. Prepare required assets:
   - Icon: 128x128px PNG
   - Screenshots: At least 1 (1280x800 or 640x400)
   - Small promotional tile: 440x280px (optional)
   - Privacy policy URL (required if collecting user data)

3. Package your extension:
\`\`\`bash
zip -r extension.zip manifest.json *.js *.html *.css *.png *.svg
\`\`\`

4. Upload to Chrome Web Store:
   - Go to Developer Dashboard
   - Click "New Item"
   - Upload your zip file
   - Fill in store listing details
   - Submit for review (usually takes 1-3 days)

## Private Distribution

For internal/private use without publishing:

1. Share the project folder with your team
2. Have them follow the "Load unpacked" instructions above
3. Or package as a `.crx` file for easier distribution:
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select your extension folder
   - Share the generated `.crx` file

## Framework Configuration

The extension loads your deployed Next.js app, which is configured in `lib/framework-config.ts`:

\`\`\`typescript
export const frameworkConfig = {
  branding: {
    name: "Your Brand",
    logoUrl: "https://your-logo.com/logo.png",
    // ... other settings
  },
  // ... RAG pages, system messages, etc.
}
\`\`\`

All customization (colors, questions, system prompts) is done in the framework config, not the extension code.

## Security & Privacy

- Extension uses Manifest V3 (latest Chrome standard)
- Minimal permissions (only activeTab and storage)
- Only runs on specified domains
- No background tracking or data collection
- All AI processing in your deployed app
- Source code is fully transparent

## Support & Updates

When you update your Next.js app:
1. Deploy the new version
2. Extension automatically loads the latest version
3. No extension update needed (unless changing extension files)

When you update extension files:
1. Make changes to root files
2. Go to `chrome://extensions/`
3. Click reload icon on your extension
4. Changes take effect immediately

For more help, refer to:
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- Your framework's README.md for app configuration

## Features

- **Draggable toggle button**: Floating button can be moved anywhere on the page
- **Close button**: X button in sidebar top-right corner to close
- **High z-index**: Sidebar appears above all page content
- **Smooth animations**: Sidebar slides in/out with smooth transitions
- **Non-intrusive**: Website content adjusts smoothly when sidebar opens
- **Auto-injection**: Automatically loads on configured domains
