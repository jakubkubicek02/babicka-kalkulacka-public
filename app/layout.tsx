import type React from "react"
import type { Metadata } from "next"
import { Exo, Albert_Sans } from "next/font/google"
import "./globals.css"

const exo = Exo({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-exo",
  display: "swap",
})

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-albert-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Kalkulačka dotací - Nová zelená úsporám",
  description: "Kalkulačka pro výpočet dotací v programu Nová zelená úsporám",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className={`${exo.variable} ${albertSans.variable} font-albert antialiased`}>{children}</body>
    </html>
  )
}
