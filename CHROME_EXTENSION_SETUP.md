# Chrome Extension Setup (Deprecated)

**Note:** Chrome extension files have been moved to the `chrome_extension/` folder for better organization.

Please see **`chrome_extension/README.md`** for complete installation and setup instructions.

## Quick Start

1. Navigate to the `chrome_extension/` folder
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `chrome_extension` folder
5. Visit hesta.com.au to see the extension in action

The `chrome_extension/` folder is now a standalone directory that contains all files needed to load the extension into Chrome without any build process or additional configuration.

## Why the Change?

Previously, extension files were scattered in the root directory alongside the Next.js app, which caused confusion. Now:

- All extension files are in one dedicated folder
- No need to rename manifest files
- Clearer separation between the web app and Chrome extension
- Easier to distribute and install
- Simpler project structure

For detailed documentation, customization options, and troubleshooting, refer to `chrome_extension/README.md`.
