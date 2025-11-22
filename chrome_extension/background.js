// Background service worker for Chrome extension

// Declare the chrome variable
const chrome = window.chrome

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("HESTA AI Extension installed")

    // Set default settings
    chrome.storage.local.set({
      apiEndpoint: "http://localhost:3000",
      enableRag: true,
      conversationHistory: [],
    })
  }
})

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "clearHistory") {
    chrome.storage.local.set({ conversationHistory: [] }, () => {
      sendResponse({ success: true })
    })
    return true // Keep channel open for async response
  }
})

// Optional: Add badge text to show unread messages or status
chrome.action.setBadgeBackgroundColor({ color: "#667eea" })
