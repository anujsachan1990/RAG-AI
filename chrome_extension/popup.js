// Default settings
const DEFAULT_SETTINGS = {
  apiEndpoint: "http://localhost:3000",
  enableRag: true,
}

// Load settings from chrome.storage
async function loadSettings() {
  return new Promise((resolve) => {
    window.chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
      resolve(result)
    })
  })
}

// Save settings to chrome.storage
async function saveSettings(settings) {
  return new Promise((resolve) => {
    window.chrome.storage.local.set(settings, () => {
      resolve()
    })
  })
}

// DOM elements
const chatMessages = document.getElementById("chatMessages")
const messageInput = document.getElementById("messageInput")
const sendBtn = document.getElementById("sendBtn")
const loadingIndicator = document.getElementById("loadingIndicator")
const settingsBtn = document.getElementById("settingsBtn")
const settingsPanel = document.getElementById("settingsPanel")
const apiEndpointInput = document.getElementById("apiEndpoint")
const enableRagCheckbox = document.getElementById("enableRag")
const saveSettingsBtn = document.getElementById("saveSettings")

let conversationHistory = []
let currentSettings = DEFAULT_SETTINGS

// Initialize
async function init() {
  currentSettings = await loadSettings()
  apiEndpointInput.value = currentSettings.apiEndpoint
  enableRagCheckbox.checked = currentSettings.enableRag

  // Load conversation history
  window.chrome.storage.local.get(["conversationHistory"], (result) => {
    if (result.conversationHistory) {
      conversationHistory = result.conversationHistory
      renderConversationHistory()
    }
  })
}

// Render conversation history
function renderConversationHistory() {
  // Clear welcome message
  chatMessages.innerHTML = ""

  conversationHistory.forEach((msg) => {
    addMessageToUI(msg.role, msg.content, msg.timestamp)
  })

  scrollToBottom()
}

// Add message to UI
function addMessageToUI(role, content, timestamp) {
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${role}`

  const bubble = document.createElement("div")
  bubble.className = "message-bubble"
  bubble.textContent = content

  const time = document.createElement("div")
  time.className = "message-time"
  time.textContent = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  messageDiv.appendChild(bubble)
  messageDiv.appendChild(time)
  chatMessages.appendChild(messageDiv)

  scrollToBottom()
}

// Scroll to bottom
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// Send message
async function sendMessage() {
  const message = messageInput.value.trim()
  if (!message) return

  // Add user message
  const userMessage = {
    role: "user",
    content: message,
    timestamp: Date.now(),
  }

  conversationHistory.push(userMessage)
  addMessageToUI("user", message, userMessage.timestamp)

  // Clear input
  messageInput.value = ""
  messageInput.style.height = "auto"
  sendBtn.disabled = true

  // Show loading
  loadingIndicator.classList.remove("hidden")

  try {
    // Call API
    const response = await fetch(`${currentSettings.apiEndpoint}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        enableRag: currentSettings.enableRag,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Add assistant message
    const assistantMessage = {
      role: "assistant",
      content: data.message || "Sorry, I could not generate a response.",
      timestamp: Date.now(),
    }

    conversationHistory.push(assistantMessage)
    addMessageToUI("assistant", assistantMessage.content, assistantMessage.timestamp)

    // Save conversation history
    window.chrome.storage.local.set({ conversationHistory })
  } catch (error) {
    console.error("Error sending message:", error)

    // Show error message
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = `Error: ${error.message}. Make sure the API endpoint is correct and the server is running.`
    chatMessages.appendChild(errorDiv)
    scrollToBottom()
  } finally {
    loadingIndicator.classList.add("hidden")
  }
}

// Event listeners
messageInput.addEventListener("input", (e) => {
  // Auto-resize textarea
  e.target.style.height = "auto"
  e.target.style.height = e.target.scrollHeight + "px"

  // Enable/disable send button
  sendBtn.disabled = !e.target.value.trim()
})

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    if (!sendBtn.disabled) {
      sendMessage()
    }
  }
})

sendBtn.addEventListener("click", sendMessage)

settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.toggle("hidden")
})

saveSettingsBtn.addEventListener("click", async () => {
  currentSettings = {
    apiEndpoint: apiEndpointInput.value.trim() || DEFAULT_SETTINGS.apiEndpoint,
    enableRag: enableRagCheckbox.checked,
  }

  await saveSettings(currentSettings)
  settingsPanel.classList.add("hidden")

  // Show confirmation
  saveSettingsBtn.textContent = "Saved!"
  setTimeout(() => {
    saveSettingsBtn.textContent = "Save Settings"
  }, 2000)
})

// Initialize on load
init()
