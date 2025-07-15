import { supabase } from "./supabase"

export interface PricingItem {
  id: string
  item_name: string
  display_name?: string
  grant_amount: number
  price_under_400k: number
  surcharge_under_400k: number
  price_over_400k: number
  surcharge_over_400k: number
  is_per_square_meter: boolean
  webhook_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PricingData {
  [itemName: string]: {
    grant: number
    priceUnder400k: number
    surchargeUnder400k: number
    priceOver400k: number
    surchargeOver400k: number
    isPerSquareMeter?: boolean
    webhookName?: string
    displayName?: string
  }
}

export async function loadPricingData(): Promise<{ success: boolean; data?: PricingData; error?: string }> {
  try {
    const { data, error } = await supabase.from("pricing").select("*").order("item_name")

    if (error) {
      console.error("Error loading pricing data:", error)
      return { success: false, error: error.message }
    }

    // Transform data to the format expected by the calculator
    const pricingData: PricingData = {}

    if (data) {
      data.forEach((item: PricingItem) => {
        pricingData[item.item_name] = {
          grant: item.grant_amount,
          priceUnder400k: item.price_under_400k,
          surchargeUnder400k: item.surcharge_under_400k,
          priceOver400k: item.price_over_400k,
          surchargeOver400k: item.surcharge_over_400k,
          isPerSquareMeter: item.is_per_square_meter,
          webhookName: item.webhook_name,
          displayName: item.display_name || item.item_name, // Use display_name if available
        }
      })
    }

    return { success: true, data: pricingData }
  } catch (error) {
    console.error("Error loading pricing data:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

export async function updatePricingItem(
  itemName: string,
  updates: Partial<Omit<PricingItem, "id" | "created_at" | "updated_at">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("pricing").update(updates).eq("item_name", itemName)

    if (error) {
      console.error("Error updating pricing item:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating pricing item:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

export async function addPricingItem(
  item: Omit<PricingItem, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("pricing").insert([item])

    if (error) {
      console.error("Error adding pricing item:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding pricing item:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

export async function deletePricingItem(itemName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("pricing").delete().eq("item_name", itemName)

    if (error) {
      console.error("Error deleting pricing item:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting pricing item:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}
