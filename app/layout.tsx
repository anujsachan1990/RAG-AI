import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HESTA AI - Your Super Assistant",
  description: "AI-powered superannuation assistant for HESTA members",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e6/8e/f4/e68ef47a-6b5f-e617-efed-4dceb4504e83/AppIcon-1x_U007emarketing-0-11-0-85-220-0.png/192x192bb.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e6/8e/f4/e68ef47a-6b5f-e617-efed-4dceb4504e83/AppIcon-1x_U007emarketing-0-11-0-85-220-0.png/512x512bb.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e6/8e/f4/e68ef47a-6b5f-e617-efed-4dceb4504e83/AppIcon-1x_U007emarketing-0-11-0-85-220-0.png/180x180bb.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased overflow-x-hidden`}>{children}</body>
    </html>
  )
}
