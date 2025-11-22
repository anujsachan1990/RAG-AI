// Background service worker for the extension
const chrome = window.chrome // Declare the chrome variable
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle sidebar
  chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" })
})

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Hesta AI Assistant extension installed")
})
