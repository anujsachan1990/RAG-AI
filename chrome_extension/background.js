// Declare the chrome variable
const chrome = require("chrome")

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle sidebar
  chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" })
})
