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
  clientAddress: string
  propertyAddress: string
  name: string
  email: string
  phone: string
  interest: string
  representativeEmail: string
  note: string
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

export function ContactFormOZ({
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
    clientAddress: "",
    propertyAddress: "",
    name: "",
    email: userEmail || "",
    phone: "",
    interest: "",
    representativeEmail: "",
    note: "",
  })

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)
  const [submitMessage, setSubmitMessage] = useState("")
  const [consulturaProcenta, setConsulturaProcenta] = useState<number | null>(null)

  useEffect(() => {
    if (initialContactData) {
      setFormData({
        region: initialContactData.region || "",
        district: initialContactData.district || "",
        clientAddress: initialContactData.clientAddress || "",
        propertyAddress: initialContactData.propertyAddress || "",
        name: initialContactData.name || "",
        email: userEmail || "",
        phone: initialContactData.phone || "",
        interest: initialContactData.interest || "",
        representativeEmail: initialContactData.representativeEmail || "",
        note: initialContactData.note || "",
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

  const generateItemsFormatted = () => {
    const formattedItems: string[] = []

    calculatorData.allItems.forEach((item) => {
      const selection = calculatorData.selections[item.id]
      if (selection?.selected || (item.isQuantityOnly && selection?.quantity > 0)) {
        const quantity = selection.quantity || 1
        const grantAmount = calculateItemAmount(item, quantity)
        const surchargeAmount = calculateItemSurcharge(item, quantity)
        const totalAmount = grantAmount + surchargeAmount
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
          item.name.includes("Bonus") ||
          item.name.includes("bonus") ||
          item.isAutomatic

        if (item.unit === "fixed") {
          if (shouldShowFullPrice) {
            line = `${displayName} - ${formatAmount(totalAmount)} - ${formatAmount(grantAmount)} - ${formatAmount(surchargeAmount)}`
          } else {
            line = `${displayName} - ${formatAmount(grantAmount)} - ${formatAmount(grantAmount)} - -`
          }
        } else if (item.unit === "percent") {
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
        consulturaProcenta: consulturaProcenta, // Přidat tuto řádku
        timestamp: new Date().toISOString(),
        formType: "OZ",
      }

      console.log("Sending OZ payload:", payload)
      console.log("Formatted items:", itemsFormatted)

      const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/15921578/u2dhu0i/"

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
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Informace o zákazníkovi
            </h3>

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
              <Label htmlFor="clientAddress">Celá adresa klienta *</Label>
              <Input
                id="clientAddress"
                value={formData.clientAddress}
                onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                placeholder="Adresa, Město, PSČ ..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Adresa nemovitosti kde se bude realizovat *</Label>
              <Input
                id="propertyAddress"
                value={formData.propertyAddress}
                onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                placeholder="Adresa nemovitosti, Město, PSČ ..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest">Co vás zajímá? *</Label>
              <Select
                value={formData.interest}
                onValueChange={(value) => handleInputChange("interest", value)}
                required
              >
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
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Informace o obchodním zástupci
            </h3>

            <div className="space-y-2">
              <Label htmlFor="representativeEmail">E-mail obchodního zástupce *</Label>
              <Input
                id="representativeEmail"
                type="email"
                value={formData.representativeEmail}
                onChange={(e) => handleInputChange("representativeEmail", e.target.value)}
                placeholder="obchodni.zastupce@firma.cz"
                required
              />
              <p className="text-xs text-gray-500">Na tento email bude odeslána kopie poptávky a další komunikace.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Poznámka</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                placeholder="Zde můžete napsat poznámky k zákazníkovi nebo projektu..."
                rows={4}
              />
            </div>
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

          {formData.interest === "Chci POUZE vyřídit dotaci" && (
            <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Vyberte % z dotace pro Consulturu</h3>
              <p className="text-sm text-orange-600 mb-4">
                Zvolte procento z celkové dotace, které bude představovat odměnu pro Consulturu za vyřízení dotace.
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[5, 6, 7, 8, 9, 10].map((procento) => (
                  <label key={procento} className="flex items-center justify-center cursor-pointer">
                    <input
                      type="radio"
                      name="consultura-procenta"
                      value={procento}
                      checked={consulturaProcenta === procento}
                      onChange={(e) => setConsulturaProcenta(Number(e.target.value))}
                      className="sr-only"
                    />
                    <div
                      className={`w-full py-3 px-4 text-center rounded-lg border-2 transition-all duration-200 ${
                        consulturaProcenta === procento
                          ? "border-orange-500 bg-orange-500 text-white font-semibold"
                          : "border-orange-200 bg-white text-orange-700 hover:border-orange-300 hover:bg-orange-50"
                      }`}
                    >
                      {procento}%
                    </div>
                  </label>
                ))}
              </div>
              {consulturaProcenta && (
                <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-800 font-medium">
                    ✅ Vybráno: <strong>{consulturaProcenta}% z dotace</strong>
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Odměna Consultury:{" "}
                    {formatAmount(Math.round(calculatorData.totals.grantAmount * (consulturaProcenta / 100)))}
                  </p>
                </div>
              )}
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
