"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EmailEntry } from "@/components/email-entry"
import { loadCalculation } from "@/lib/supabase"

export default function EmailPage() {
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const router = useRouter()

  const handleEmailSubmit = async (email: string) => {
    setEmailLoading(true)
    setEmailError("")

    try {
      const result = await loadCalculation(email)

      if (result.success) {
        // Store email in sessionStorage to pass to main page
        sessionStorage.setItem("userEmail", email)

        if (result.data && result.data.selections && Object.keys(result.data.selections).length > 0) {
          // User has previous calculation - store it and redirect
          sessionStorage.setItem("calculationData", JSON.stringify(result.data))
          sessionStorage.setItem("isReturningUser", "true")
        } else {
          // New user
          sessionStorage.setItem("isReturningUser", "false")
        }

        // Redirect to main page
        router.push("/")
      } else {
        setEmailError(result.error || "Došlo k chybě při načítání dat")
      }
    } catch (error) {
      console.error("Error loading calculation:", error)
      setEmailError("Došlo k neočekávané chybě")
    } finally {
      setEmailLoading(false)
    }
  }

  return <EmailEntry onEmailSubmit={handleEmailSubmit} loading={emailLoading} error={emailError} />
}
