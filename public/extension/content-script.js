// Content script that injects the sidebar into hesta.com.au
;(() => {
  const SIDEBAR_WIDTH = 500
  let sidebarOpen = false
  let sidebarIframe = null
  let sidebarContainer = null
  const chrome = window.chrome // Declare the chrome variable

  // Create and inject the sidebar
  function createSidebar() {
    if (sidebarContainer) return

    // Create container
    sidebarContainer = document.createElement("div")
    sidebarContainer.id = "hesta-ai-sidebar-container"
    sidebarContainer.style.cssText = `
      position: fixed;
      top: 0;
      right: -${SIDEBAR_WIDTH}px;
      width: ${SIDEBAR_WIDTH}px;
      height: 100vh;
      z-index: 2147483647;
      transition: right 0.3s ease-in-out;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    `

    // Create iframe
    sidebarIframe = document.createElement("iframe")
    sidebarIframe.id = "hesta-ai-sidebar-iframe"
    sidebarIframe.src = chrome.runtime.getURL("sidebar.html")
    sidebarIframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    `

    sidebarContainer.appendChild(sidebarIframe)
    document.body.appendChild(sidebarContainer)

    // Create toggle button
    createToggleButton()
  }

  // Create floating toggle button
  function createToggleButton() {
    const button = document.createElement("button")
    button.id = "hesta-ai-toggle-btn"
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #6366f1;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      z-index: 2147483646;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `

    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.1)"
      button.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.5)"
    })

    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)"
      button.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.4)"
    })

    button.addEventListener("click", toggleSidebar)
    document.body.appendChild(button)
  }

  // Toggle sidebar open/closed
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen

    if (sidebarOpen) {
      // Slide website content to the left
      document.body.style.transition = "margin-right 0.3s ease-in-out"
      document.body.style.marginRight = `${SIDEBAR_WIDTH}px`

      // Show sidebar
      sidebarContainer.style.right = "0px"

      // Update button position
      const button = document.getElementById("hesta-ai-toggle-btn")
      if (button) {
        button.style.right = `${SIDEBAR_WIDTH + 20}px`
      }
    } else {
      // Reset website content
      document.body.style.marginRight = "0px"

      // Hide sidebar
      sidebarContainer.style.right = `-${SIDEBAR_WIDTH}px`

      // Update button position
      const button = document.getElementById("hesta-ai-toggle-btn")
      if (button) {
        button.style.right = "20px"
      }
    }
  }

  // Listen for messages from extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleSidebar") {
      toggleSidebar()
    }
  })

  // Initialize sidebar when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSidebar)
  } else {
    createSidebar()
  }
})()
