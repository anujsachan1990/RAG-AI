// Create and inject the sidebar toggle button and sidebar itself
;(() => {
  // Declare chrome variable
  const chrome = window.chrome

  // Check if already injected
  if (document.getElementById("hesta-ai-sidebar-container")) {
    return
  }

  // Create toggle button
  const toggleButton = document.createElement("button")
  toggleButton.id = "hesta-ai-toggle"
  toggleButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
    </svg>
  `
  toggleButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #2563eb;
    color: white;
    border: none;
    cursor: move;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
    user-select: none;
  `

  let isDragging = false
  let currentX
  let currentY
  let initialX
  let initialY
  let xOffset = 0
  let yOffset = 0

  toggleButton.addEventListener("mousedown", dragStart)
  document.addEventListener("mousemove", drag)
  document.addEventListener("mouseup", dragEnd)

  function dragStart(e) {
    initialX = e.clientX - xOffset
    initialY = e.clientY - yOffset

    if (e.target === toggleButton) {
      isDragging = true
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault()

      currentX = e.clientX - initialX
      currentY = e.clientY - initialY

      xOffset = currentX
      yOffset = currentY

      setTranslate(currentX, currentY, toggleButton)
    }
  }

  function dragEnd(e) {
    if (isDragging) {
      initialX = currentX
      initialY = currentY
      isDragging = false
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`
  }

  toggleButton.addEventListener("mouseenter", () => {
    if (!isDragging) {
      toggleButton.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)"
    }
  })

  toggleButton.addEventListener("mouseleave", () => {
    toggleButton.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
  })

  const closeButton = document.createElement("button")
  closeButton.id = "hesta-ai-close"
  closeButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
  closeButton.style.cssText = `
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.05);
    color: #374151;
    border: none;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  `

  closeButton.addEventListener("mouseenter", () => {
    closeButton.style.background = "rgba(0, 0, 0, 0.1)"
  })

  closeButton.addEventListener("mouseleave", () => {
    closeButton.style.background = "rgba(0, 0, 0, 0.05)"
  })

  closeButton.addEventListener("click", toggleSidebar)

  // Create sidebar container
  const sidebarContainer = document.createElement("div")
  sidebarContainer.id = "hesta-ai-sidebar-container"
  sidebarContainer.style.cssText = `
    position: fixed;
    top: 0;
    right: -500px;
    width: 500px;
    height: 100vh;
    z-index: 2147483647;
    transition: right 0.3s ease;
    box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
  `

  // Create iframe for the app
  const iframe = document.createElement("iframe")
  iframe.id = "hesta-ai-iframe"
  iframe.src = chrome.runtime.getURL("sidebar.html")
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  `

  sidebarContainer.appendChild(closeButton)
  sidebarContainer.appendChild(iframe)

  // State
  let isOpen = false

  // Toggle function
  function toggleSidebar() {
    isOpen = !isOpen

    if (isOpen) {
      // Open sidebar
      sidebarContainer.style.right = "0"
      document.body.style.marginRight = "500px"
      document.body.style.transition = "margin-right 0.3s ease"
    } else {
      // Close sidebar
      sidebarContainer.style.right = "-500px"
      document.body.style.marginRight = "0"
    }
  }

  toggleButton.addEventListener("click", toggleSidebar)

  // Inject elements
  document.body.appendChild(toggleButton)
  document.body.appendChild(sidebarContainer)

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleSidebar") {
      toggleSidebar()
    }
  })
})()
