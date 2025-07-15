"use client"

import { useState, useEffect } from "react"
import { SubsidyCalculator } from "@/components/subsidy-calculator-oz"
import { EmailEntry } from "@/components/email-entry"
import { loadCalculation } from "@/lib/supabase"
import { loadPricingData } from "@/lib/pricing"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ArrowLeft, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PricingAdmin } from "@/components/pricing-admin"

export default function OZPage() {
  const [subsidyData, setSubsidyData] = useState(null)
  const [pricingData, setPricingData] = useState(null)
  const [districtsData, setDistrictsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const [showEmailEntry, setShowEmailEntry] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [loadedCalculation, setLoadedCalculation] = useState(null)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [showPricingAdmin, setShowPricingAdmin] = useState(false)

  // Check if user is admin (special email)
  const isAdminUser = userEmail === "jakub.kubicek@elead.agency"

  useEffect(() => {
    Promise.all([
      fetch("/dotace-updated.json").then((res) => res.json()),
      loadPricingData(), // Load from Supabase instead of JSON
      fetch("/districts-data.json").then((res) => res.json()),
    ])
      .then(([subsidy, pricingResult, districts]) => {
        setSubsidyData(subsidy)

        if (pricingResult.success) {
          setPricingData({ pricingData: pricingResult.data })
        } else {
          console.error("Failed to load pricing data:", pricingResult.error)
          setLoadError("Chyba při načítání cenových dat: " + pricingResult.error)
          // Fallback to JSON file
          return fetch("/pricing-data.json").then((res) => res.json())
        }

        setDistrictsData(districts)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load data:", err)
        setLoadError("Chyba při načítání dat aplikace")
        setLoading(false)
      })
  }, [])

  const handleEmailSubmit = async (email: string) => {
    setEmailLoading(true)
    setEmailError("")

    try {
      const result = await loadCalculation(email)
      console.log("Load calculation result:", result) // Debug log

      if (result.success) {
        setUserEmail(email)

        if (result.data && result.data.selections && Object.keys(result.data.selections).length > 0) {
          // User has previous calculation with actual data
          console.log("Loaded calculation data:", result.data) // Debug log
          console.log("Selections in loaded data:", result.data.selections) // Debug log
          setLoadedCalculation(result.data)
          setShowWelcomeMessage(true)
          setIsReturningUser(true)
        } else {
          // New user or user with empty calculation
          console.log("No previous calculation found or empty data") // Debug log
          setLoadedCalculation(null)
          setShowWelcomeMessage(false)
          setIsReturningUser(false)
        }

        // Hide email entry and show calculator
        setShowEmailEntry(false)
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

  const handleShowEmailEntry = () => {
    setShowEmailEntry(true)
    setUserEmail("")
    setLoadedCalculation(null)
    setShowWelcomeMessage(false)
    setIsReturningUser(false)
    setEmailError("")
  }

  const handleBackToCalculator = () => {
    setShowEmailEntry(false)
    setEmailError("")
  }

  const handleLogout = () => {
    setUserEmail("")
    setLoadedCalculation(null)
    setShowWelcomeMessage(false)
    setIsReturningUser(false)
    setEmailError("")
    // This will trigger a re-render showing the anonymous calculator
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání kalkulačky...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Zkusit znovu
          </Button>
        </div>
      </div>
    )
  }

  if (!subsidyData || !pricingData || !districtsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Chyba při načítání dat kalkulačky</p>
        </div>
      </div>
    )
  }

  if (showEmailEntry) {
    return (
      <div>
        <EmailEntry onEmailSubmit={handleEmailSubmit} loading={emailLoading} error={emailError} />
        <div className="fixed top-4 left-4">
          <Button variant="outline" onClick={handleBackToCalculator} className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Zpět na kalkulačku
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-5 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        {/* Header with user info or login button */}
        <div className="flex items-center justify-between mb-6">
          {userEmail ? (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-transparent text-gray-600 hover:text-red-600 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </Button>
          ) : (
            <div></div> // Empty div for spacing when no user is logged in
          )}

          <div className="flex items-center gap-4">
            {userEmail ? (
              <div className="text-sm text-gray-600">
                Přihlášen jako: <span className="font-medium">{userEmail}</span>
                {isAdminUser && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Admin</span>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleShowEmailEntry}
                className="flex items-center gap-2 bg-transparent"
              >
                <User className="w-4 h-4" />
                Již mám kalkulaci
              </Button>
            )}
          </div>
        </div>

        <h1 className="font-exo text-green-700 text-center mb-6 text-3xl md:text-5xl font-bold">
          Kalkulace - Oprav Dům Po Babičce
        </h1>

        {/* Welcome message for returning users */}
        {showWelcomeMessage && loadedCalculation && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Vítejte zpět! Načetli jsme vaši předchozí kalkulaci. Můžete pokračovat v úpravách nebo začít znovu.
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome message for new users */}
        {!userEmail && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Vítejte! Začínáte novou kalkulaci. Vaše data budou uložena až po odeslání kontaktního formuláře.
            </AlertDescription>
          </Alert>
        )}

        {/* Admin notice */}
        {isAdminUser && (
          <Alert className="mb-6 border-purple-200 bg-purple-50">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800 flex items-center justify-between">
              <span>Admin režim aktivní - zobrazují se skutečné ceny bez rozmazání.</span>
              <Button variant="outline" size="sm" onClick={() => setShowPricingAdmin(true)} className="ml-4">
                Správa cen
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <SubsidyCalculator
          data={subsidyData}
          pricingData={pricingData.pricingData}
          districts={districtsData.districts}
          userEmail={userEmail}
          initialData={loadedCalculation}
          isNewUser={!isReturningUser}
          isAdminUser={isAdminUser}
        />
      </div>
      {isAdminUser && <PricingAdmin isVisible={showPricingAdmin} onClose={() => setShowPricingAdmin(false)} />}
    </main>
  )
}
