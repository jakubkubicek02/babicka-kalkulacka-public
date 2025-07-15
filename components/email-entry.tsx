"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowRight, Loader2 } from "lucide-react"

interface EmailEntryProps {
  onEmailSubmit: (email: string) => void
  loading?: boolean
  error?: string
}

export function EmailEntry({ onEmailSubmit, loading = false, error }: EmailEntryProps) {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setEmailError("Email je povinný")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Zadejte platný email")
      return
    }

    setEmailError("")
    onEmailSubmit(email.trim().toLowerCase())
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-exo text-green-700 text-3xl md:text-4xl font-bold mb-4">{"Kalkulačka dotací VPTD"}    </h1>
          <p className="text-gray-600 text-lg">Nová zelená úsporám</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-green-700" />
            </div>
            <CardTitle className="text-xl font-exo text-green-700">Začněte s kalkulací</CardTitle>
            <CardDescription>Zadejte svůj email pro pokračování v kalkulaci nebo vytvoření nové</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError("")
                  }}
                  placeholder="vas@email.cz"
                  disabled={loading}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && <p className="text-sm text-red-600">{emailError}</p>}
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Načítání...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Pokračovat
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Zadáním emailu souhlasíte s uložením vaší kalkulace pro budoucí použití.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
