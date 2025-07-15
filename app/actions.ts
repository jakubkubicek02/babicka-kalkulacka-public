"use server"

interface FormSubmissionData {
  contactForm: {
    region: string
    district: string
    name: string
    email: string
    phone: string
    message: string
    interest: string
  }
  calculatorSelections: any
  calculatorTotals: {
    grantAmount: number
    surchargeAmount: number
    finalAmount: number
    excessAmount: number
  }
  timestamp: string
}

export async function submitContactForm(data: FormSubmissionData) {
  try {
    console.log("Server Action - Received data:", data)

    // Here you would normally send to your actual webhook
    // For now, we'll simulate a successful submission

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // You can replace this with your actual webhook URL
    // const response = await fetch("YOUR_WEBHOOK_URL", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(data),
    // })

    // if (!response.ok) {
    //   throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    // }

    return {
      success: true,
      message: "Vaše poptávka byla úspěšně odeslána. Brzy se vám ozveme!",
    }
  } catch (error) {
    console.error("Server Action error:", error)
    return {
      success: false,
      message: "Došlo k chybě při odesílání. Zkuste to prosím znovu.",
    }
  }
}
