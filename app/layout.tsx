import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { frameworkConfig } from "@/lib/framework-config"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: frameworkConfig.seo.title,
  description: frameworkConfig.seo.description,
  generator: frameworkConfig.seo.generator,
  icons: {
    icon: [
      {
        url: frameworkConfig.branding.icons.icon192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: frameworkConfig.branding.icons.icon512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: frameworkConfig.branding.icons.appleTouchIcon,
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
