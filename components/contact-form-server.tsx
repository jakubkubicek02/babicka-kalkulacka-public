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
import { submitContactForm } from "@/app/actions"

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

const interestOptions = [
  "Chci POUZE vyřídit dotaci",
  "Chci vyřídit dotaci i realizaci",
]

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
  }
  districts: { [key: string]: string[] }
}

export function ContactFormServer({ calculatorData, districts }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    region: "",
    district: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    interest: "",
  })

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)
  const [submitMessage, setSubmitMessage] = useState("")

  // Update available districts when region changes
  useEffect(() => {
    if (formData.region && districts[formData.region]) {
      setAvailableDistricts(districts[formData.region])
      // Reset district if it's not available in the new region
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const payload = {
        contactForm: formData,
        calculatorSelections: calculatorData.selections,
        calculatorTotals: calculatorData.totals,
        timestamp: new Date().toISOString(),
      }

      const result = await submitContactForm(payload)

      if (result.success) {
        setSubmitStatus("success")
        setSubmitMessage(result.message)

        // Reset form
        setFormData({
          region: "",
          district: "",
          name: "",
          email: "",
          phone: "",
          message: "",
          interest: "",
        })
      } else {
        setSubmitStatus("error")
        setSubmitMessage(result.message)
      }
    } catch (error) {
      console.error("Submit error:", error)
      setSubmitStatus("error")
      setSubmitMessage("Došlo k neočekávané chybě. Zkuste to prosím znovu.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
              />
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
                Odeslat poptávku
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
