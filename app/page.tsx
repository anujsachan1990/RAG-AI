"use client"
import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { Header } from "@/components/header"
import { LandingScreen } from "@/components/landing-screen"

export default function Home() {
  const [showChat, setShowChat] = useState(false)
  const [initialMessage, setInitialMessage] = useState("")

  const handleStartChat = (message: string) => {
    setInitialMessage(message)
    setShowChat(true)
  }

  const handleResetToHome = () => {
    setShowChat(false)
    setInitialMessage("")
  }

  if (!showChat) {
    return <LandingScreen onStartChat={handleStartChat} />
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header onLogoClick={handleResetToHome} />
      <main className="flex-1">
        <ChatInterface initialMessage={initialMessage} />
      </main>
    </div>
  )
}
