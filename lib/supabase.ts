import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type CalculationData = {
  id?: string
  email: string
  selections: any
  totals: {
    grantAmount: number
    surchargeAmount: number
    finalAmount: number
    excessAmount: number
  }
  contact_form?: any
  created_at?: string
  updated_at?: string
}

export async function saveCalculation(data: CalculationData) {
  try {
    const { data: result, error } = await supabase
      .from("calculations")
      .upsert(
        {
          email: data.email,
          selections: data.selections,
          totals: data.totals,
          contact_form: data.contact_form,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
        },
      )
      .select()

    if (error) {
      console.error("Error saving calculation:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error("Error saving calculation:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

export async function loadCalculation(email: string) {
  try {
    const { data, error } = await supabase.from("calculations").select("*").eq("email", email).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found - this is normal for new users
        return { success: true, data: null }
      }
      console.error("Error loading calculation:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error loading calculation:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}
