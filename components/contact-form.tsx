"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Send } from "lucide-react"
import { saveCalculation } from "@/lib/supabase"

const regions = [
  "Praha",
  "Středočeský kraj",
  "Jihočeský kraj",
  "Plzeňský kraj",
  "Karlovarský kraj",
  "Ústecký kraj",
  "Liberecký kraj",
  "Královéhradecký kraj",
  "Pardubický kraj",
  "Vysočina",
  "Jihomoravský kraj",
  "Olomoucký kraj",
  "Zlínský kraj",
  "Moravskoslezský kraj",
]

const interestOptions = ["Chci POUZE vyřídit dotaci", "Chci vyřídit dotaci i realizaci"]

interface ContactFormData {
  region: string
  district: string
  name: string
  email: string
  phone: string
  message: string
  interest: string
}

interface ContactFormProps {
  calculatorData: {
    selections: any
    totals: {
      grantAmount: number
      surchargeAmount: number
      finalAmount: number
      excessAmount: number
    }
    allItems: any[]
    implementationSelections: { [key: string]: boolean }
    setImplementationSelections: (selections: { [key: string]: boolean }) => void
  }
  districts: { [key: string]: string[] }
  userEmail?: string
  initialContactData?: any
  isNewUser?: boolean
  pricingData: { [key: string]: any }
}

export function ContactForm({
  calculatorData,
  districts,
  userEmail,
  initialContactData,
  isNewUser = true,
  pricingData,
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    region: "",
    district: "",
    name: "",
    email: userEmail || "",
    phone: "",
    message: "",
    interest: "",
  })

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)
  const [submitMessage, setSubmitMessage] = useState("")

  useEffect(() => {
    if (initialContactData) {
      setFormData({
        region: initialContactData.region || "",
        district: initialContactData.district || "",
        name: initialContactData.name || "",
        email: userEmail || "",
        phone: initialContactData.phone || "",
        message: initialContactData.message || "",
        interest: initialContactData.interest || "",
      })
    } else {
      setFormData((prev) => ({ ...prev, email: userEmail || "" }))
    }
  }, [initialContactData, userEmail])

  useEffect(() => {
    if (formData.region && districts[formData.region]) {
      setAvailableDistricts(districts[formData.region])
      if (formData.district && !districts[formData.region].includes(formData.district)) {
        setFormData((prev) => ({ ...prev, district: "" }))
      }
    } else {
      setAvailableDistricts([])
      setFormData((prev) => ({ ...prev, district: "" }))
    }
  }, [formData.region, districts])

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImplementationChange = (itemId: string, checked: boolean) => {
    calculatorData.setImplementationSelections({
      ...calculatorData.implementationSelections,
      [itemId]: checked,
    })
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("cs-CZ") + " Kč"
  }

  const getUnitDisplay = (unit: string) => {
    switch (unit) {
      case "m2":
        return "m²"
      case "m3":
        return "m³"
      case "m":
        return "m"
      case "kwp":
        return "kWp"
      case "kwh":
        return "kWh"
      case "body":
        return "body"
      case "percent":
        return "%"
      default:
        return ""
    }
  }

  const calculateItemAmount = (item: any, quantity: number): number => {
    const itemPricing = pricingData[item.name]
    if (!itemPricing) {
      const { price, price2, unit, maxAmount } = item
      let amount = 0

      switch (unit) {
        case "fixed":
          amount = price
          break
        case "percent":
          amount = 0
          break
        case "m3":
          if (price2) {
            amount = price + price2 * quantity
            if (maxAmount) amount = Math.min(amount, maxAmount)
          } else {
            amount = price * quantity
          }
          break
        case "body":
          amount = price * quantity
          if (maxAmount) amount = Math.min(amount, maxAmount)
          break
        default:
          amount = price * quantity
      }

      return amount
    }

    const grant = itemPricing.grant || 0

    if (item.name === "Venkovní žaluzie") {
      const windowSizeSelection = calculatorData.selections["velikost-oken"]
      const windowSize = windowSizeSelection?.quantity || 0
      if (windowSize > 0) {
        return grant * windowSize
      }
      return 0
    } else if (item.name === "Velikost oken (m²)") {
      return 0
    }

    switch (item.unit) {
      case "fixed":
        return grant
      case "percent":
        return 0
      case "body":
        let amount = grant * quantity
        if (item.maxAmount) amount = Math.min(amount, item.maxAmount)
        return amount
      default:
        return grant * quantity
    }
  }

  const calculateItemSurcharge = (item: any, quantity: number): number => {
    const itemPricing = pricingData[item.name]
    if (!itemPricing) {
      return 0
    }

    const surchargeKey = "surchargeUnder400k"
    const surchargeRate = itemPricing[surchargeKey] || 0

    if (item.name === "Venkovní žaluzie") {
      const windowSizeSelection = calculatorData.selections["velikost-oken"]
      const windowSize = windowSizeSelection?.quantity || 0
      if (windowSize > 0) {
        return surchargeRate * windowSize
      }
      return 0
    } else if (item.name === "Velikost oken (m²)") {
      return 0
    }

    if (item.unit === "fixed") {
      return surchargeRate
    } else if (item.unit === "percent") {
      return 0
    } else {
      return surchargeRate * quantity
    }
  }

  const extractFVEPower = (itemName: string): string => {
    const match = itemName.match(/^([\d,]+\s*kWp)/)
    return match ? match[1] : itemName
  }

  const getSelectedItemsForImplementation = () => {
    const selectedItems: any[] = []

    calculatorData.allItems.forEach((item) => {
      const selection = calculatorData.selections[item.id]

      if (!selection?.selected && !(item.isQuantityOnly && selection?.quantity > 0)) {
        return
      }

      if (item.name.includes("Bonus") || item.name.includes("bonus")) {
        return
      }

      if (item.isQuantityOnly && item.requiresParent) {
        return
      }

      if (item.isAutomatic) {
        return
      }

      selectedItems.push(item)
    })

    return selectedItems
  }

  const calculateBonusAmounts = () => {
    let totalBonusAmount = 0
    let baseAmountForPercentage = 0
    let bonusPriceAmount = 0 // Only for bonuses that add to price

    // Calculate base amount (non-bonus items) for percentage calculation
    calculatorData.allItems.forEach((item) => {
      const selection = calculatorData.selections[item.id]

      if (item.name.includes("Bonus") || item.name.includes("bonus")) {
        return // Skip bonus items for base calculation
      }

      const shouldIncludeQuantityOnly =
        item.isQuantityOnly &&
        item.requiresParent &&
        calculatorData.selections[item.requiresParent]?.selected &&
        selection?.quantity > 0

      if (selection?.selected || shouldIncludeQuantityOnly) {
        const quantity = selection?.quantity || 1
        baseAmountForPercentage += calculateItemAmount(item, quantity)
      }
    })

    // Calculate bonus amounts
    calculatorData.allItems.forEach((item) => {
      const selection = calculatorData.selections[item.id]

      if (selection?.selected && (item.name.includes("Bonus") || item.name.includes("bonus"))) {
        if (item.unit === "percent" && item.percentage) {
          // Percentage bonuses only add to grant, not to price
          const bonusAmount = baseAmountForPercentage * (item.percentage / 100)
          totalBonusAmount += bonusAmount
          // Don't add to bonusPriceAmount - percentage bonuses don't increase total price
        } else if (item.unit === "fixed") {
          // Fixed bonuses add to both price and grant
          totalBonusAmount += item.price
          bonusPriceAmount += item.price
        } else {
          const quantity = selection.quantity || 1
          const bonusAmount = calculateItemAmount(item, quantity)
          totalBonusAmount += bonusAmount
          bonusPriceAmount += bonusAmount
        }
      }
    })

    return {
      totalBonusAmount,
      baseAmountForPercentage,
      bonusPriceAmount, // Only bonuses that should be added to total price
    }
  }

  const generateItemsFormatted = () => {
    const formattedItems: string[] = []
    const bonusInfo = calculateBonusAmounts()

    calculatorData.allItems.forEach((item) => {
      const selection = calculatorData.selections[item.id]

      // For quantity-only items, check if parent is selected AND quantity > 0
      const shouldIncludeQuantityOnly =
        item.isQuantityOnly &&
        item.requiresParent &&
        calculatorData.selections[item.requiresParent]?.selected &&
        selection?.quantity > 0

      if (selection?.selected || shouldIncludeQuantityOnly) {
        const quantity = selection.quantity || 1
        let grantAmount = 0
        let surchargeAmount = 0
        let priceAmount = 0

        // Check if this is a bonus item
        const isBonusItem =
          item.name.includes("Bonus") ||
          item.name.includes("bonus") ||
          item.id?.includes("bonus") ||
          (item.id && item.id.startsWith("bonus-"))

        if (isBonusItem) {
          // For ALL bonus items, regardless of unit type
          if (item.unit === "percent" && item.percentage) {
            grantAmount = bonusInfo.baseAmountForPercentage * (item.percentage / 100)
          } else {
            grantAmount = calculateItemAmount(item, quantity)
          }
          surchargeAmount = -grantAmount // Always negative for bonuses
          priceAmount = 0 // Bonuses never add to total price
        } else {
          // For regular items
          grantAmount = calculateItemAmount(item, quantity)
          surchargeAmount = calculateItemSurcharge(item, quantity)
          priceAmount = grantAmount + surchargeAmount
        }

        const totalAmount = isBonusItem ? 0 : priceAmount // For bonuses, always show 0 as total price
        const unitDisplay = getUnitDisplay(item.unit)

        let line = ""
        let displayName = item.name

        if (item.name.includes("kWp -")) {
          displayName = extractFVEPower(item.name)
        }

        const isSelectedForImplementation = calculatorData.implementationSelections[item.id] !== false
        const shouldShowFullPrice =
          formData.interest !== "Chci vyřídit dotaci i realizaci" ||
          isSelectedForImplementation ||
          isBonusItem ||
          item.isAutomatic

        if (item.unit === "fixed" || isBonusItem) {
          if (shouldShowFullPrice) {
            line = `${displayName} - ${formatAmount(totalAmount)} - ${formatAmount(grantAmount)} - ${formatAmount(surchargeAmount)}`
          } else {
            line = `${displayName} - ${formatAmount(grantAmount)} - ${formatAmount(grantAmount)} - -`
          }
        } else if (item.unit === "percent" && !isBonusItem) {
          // For percentage items that are NOT bonuses
          line = `${displayName} - ${item.percentage}% - ${formatAmount(grantAmount)} - ${formatAmount(surchargeAmount)}`
        } else {
          if (shouldShowFullPrice) {
            line = `${displayName} (${quantity} ${unitDisplay}) - ${formatAmount(totalAmount)} - ${formatAmount(grantAmount)} - ${formatAmount(surchargeAmount)}`
          } else {
            line = `${displayName} (${quantity} ${unitDisplay}) - ${formatAmount(grantAmount)} - ${formatAmount(grantAmount)} - -`
          }
        }

        formattedItems.push(line)
      }
    })

    return formattedItems.join("\n")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const itemsFormatted = generateItemsFormatted()
      const bonusInfo = calculateBonusAmounts()

      const calculationData = {
        email: formData.email,
        selections: calculatorData.selections,
        totals: calculatorData.totals,
        contact_form: formData,
      }

      const saveResult = await saveCalculation(calculationData)

      if (!saveResult.success) {
        throw new Error("Failed to save calculation")
      }

      const payload = {
        contactForm: formData,
        calculatorSelections: calculatorData.selections,
        calculatorTotals: calculatorData.totals,
        implementationSelections: calculatorData.implementationSelections,
        itemsFormatted: itemsFormatted,
        bonusInfo: {
          totalBonusAmount: bonusInfo.totalBonusAmount,
          bonusAmountFormatted: formatAmount(bonusInfo.totalBonusAmount),
        },
        timestamp: new Date().toISOString(),
      }

      console.log("Sending payload:", payload)
      console.log("Formatted items:", itemsFormatted)
      console.log("Bonus info:", bonusInfo)

      const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/15921578/ubelpz9/"

      const response = await fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        mode: "no-cors",
      })

      setSubmitStatus("success")
      setSubmitMessage("Vaše poptávka byla úspěšně odeslána. Brzy se vám ozveme!")
    } catch (error) {
      console.error("Submit error:", error)
      setSubmitStatus("error")
      setSubmitMessage("Došlo k chybě při odesílání. Zkuste to prosím znovu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedItemsForImplementation = getSelectedItemsForImplementation()
  const showImplementationSection =
    formData.interest === "Chci vyřídit dotaci i realizaci" && selectedItemsForImplementation.length > 0

  return (
    <Card className="w-full max-w-none mx-0">
      <CardHeader>
        <CardTitle className="text-2xl font-exo text-green-700">Kontaktní formulář</CardTitle>
        <CardDescription>
          Vyplňte formulář a my vám připravíme nezávaznou nabídku na základě vaší kalkulace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Kraj *</Label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte kraj" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Okres *</Label>
              <Select
                value={formData.district}
                onValueChange={(value) => handleInputChange("district", value)}
                required
                disabled={!formData.region}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.region ? "Vyberte okres" : "Nejprve vyberte kraj"} />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest">Co vás zajímá? *</Label>
            <Select value={formData.interest} onValueChange={(value) => handleInputChange("interest", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte možnost" />
              </SelectTrigger>
              <SelectContent>
                {interestOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Jméno a příjmení *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Zadejte vaše jméno"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="vas@email.cz"
                required
                disabled={!isNewUser}
                className={!isNewUser ? "bg-gray-100" : ""}
              />
              {!isNewUser && (
                <p className="text-xs text-gray-500">
                  Email nelze změnit. Pro změnu emailu použijte tlačítko "Již mám kalkulaci" nahoře.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+420 123 456 789"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Zpráva</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Zde můžete napsat dodatečné informace o vašem projektu..."
              rows={4}
            />
          </div>

          {showImplementationSection && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Co chcete realizovat s námi?</h3>
              <p className="text-sm text-blue-600 mb-4">
                Zaškrtněte položky, které chcete realizovat s naší firmou. Nezaškrtnuté položky budou v nabídce
                obsahovat pouze dotaci.
              </p>
              <div className="space-y-3">
                {selectedItemsForImplementation.map((item) => {
                  const selection = calculatorData.selections[item.id]
                  const quantity = selection?.quantity || 1
                  const unitDisplay = getUnitDisplay(item.unit)

                  let displayName = item.name
                  if (item.name.includes("kWp -")) {
                    displayName = extractFVEPower(item.name)
                  }

                  let itemLabel = displayName
                  if (item.unit !== "fixed" && item.unit !== "percent") {
                    itemLabel += ` (${quantity} ${unitDisplay})`
                  }

                  return (
                    <label key={item.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calculatorData.implementationSelections[item.id] !== false}
                        onChange={(e) => handleImplementationChange(item.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{itemLabel}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {submitStatus && (
            <Alert className={submitStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {submitStatus === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={submitStatus === "success" ? "text-green-800" : "text-red-800"}>
                {submitMessage}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Odesílání...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Odeslat poptávku a zjistit ceny
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
