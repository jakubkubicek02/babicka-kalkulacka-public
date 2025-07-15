"use client"

import { useState, useEffect } from "react"
import { CategorySection } from "./category-section"
import { TotalSection } from "./total-section"
import { SummaryBox } from "./summary-box"
import { ContactFormOZ } from "./contact-form-oz"
import { saveCalculation } from "@/lib/supabase"

interface SubsidyData {
  categories: Category[]
  regions: string[]
}

interface Category {
  id: string
  name: string
  maxLimit?: number
  radioGroup?: string
  info?: string
  isBonus?: boolean
  isGroup?: boolean
  items?: SubsidyItem[]
  conditionalItems?: SubsidyItem[]
  subSections?: SubSection[]
  subCategories?: SubCategory[]
}

interface SubCategory {
  id: string
  name: string
  maxLimit?: number
  items: SubsidyItem[]
  conditionalItems?: SubsidyItem[]
  subSections?: SubSection[]
}

interface SubSection {
  id: string
  name: string
  items: SubsidyItem[]
}

interface SubsidyItem {
  id: string
  name: string
  price: number
  price2?: number
  unit: string
  hasQuantity: boolean
  step?: number
  maxAmount?: number
  max?: number
  percentage?: number
  requiresCondition?: boolean
  radioGroup?: string
  requiresParent?: string
  isQuantityOnly?: boolean
  isAutomatic?: boolean
  alwaysSelected?: boolean
  hidePrice?: boolean
}

interface Selection {
  [itemId: string]: {
    selected: boolean
    quantity: number
  }
}

interface SubsidyCalculatorProps {
  data: SubsidyData
  pricingData: { [key: string]: any }
  districts: { [key: string]: string[] }
  userEmail?: string
  initialData?: any
  isNewUser?: boolean
  isAdminUser?: boolean
}

export function SubsidyCalculator({
  data,
  pricingData,
  districts,
  userEmail,
  initialData,
  isNewUser = true,
  isAdminUser = false,
}: SubsidyCalculatorProps) {
  const [selections, setSelections] = useState<Selection>({})
  const [categoryTotals, setCategoryTotals] = useState<{ [key: string]: number }>({})
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalSurcharge, setTotalSurcharge] = useState(0)
  const [excessAmount, setExcessAmount] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [implementationSelections, setImplementationSelections] = useState<{ [key: string]: boolean }>({})
  const [selectedMunicipality, setSelectedMunicipality] = useState("")

  // Create a flat list of all items for easier access
  const allItems = data.categories.reduce((acc, category) => {
    let categoryItems: SubsidyItem[] = []

    if (category.isGroup && category.subCategories) {
      // Handle group categories
      category.subCategories.forEach((subCategory) => {
        categoryItems = [...categoryItems, ...(subCategory.items || []), ...(subCategory.conditionalItems || [])]

        if (subCategory.subSections) {
          subCategory.subSections.forEach((subSection) => {
            categoryItems = [...categoryItems, ...(subSection.items || [])]
          })
        }
      })
    } else {
      // Handle regular categories
      categoryItems = [...(category.items || []), ...(category.conditionalItems || [])]

      if (category.subSections) {
        category.subSections.forEach((subSection) => {
          categoryItems = [...categoryItems, ...(subSection.items || [])]
        })
      }
    }

    return [...acc, ...categoryItems]
  }, [] as SubsidyItem[])

  // Load initial data if provided
  useEffect(() => {
    console.log("Loading initial data:", initialData)

    if (initialData && initialData.selections) {
      console.log("Setting selections from initial data:", initialData.selections)
      // Ensure we merge with default values
      const defaultSelections = {
        "velikost-nadrze": {
          selected: false,
          quantity: 5,
        },
        "velikost-oken": {
          selected: false,
          quantity: 1,
        },
        // Always select project documentation bonus
        "bonus-projektova-dokumentace": {
          selected: true,
          quantity: 1,
        },
      }

      // Merge initial data with defaults
      const mergedSelections = { ...defaultSelections, ...initialData.selections }
      console.log("Merged selections:", mergedSelections)
      setSelections(mergedSelections)
    } else {
      console.log("No initial selections, using defaults")
      // Initialize default quantities for quantity-only items and automatic bonuses
      setSelections({
        "velikost-nadrze": {
          selected: false,
          quantity: 5,
        },
        "velikost-oken": {
          selected: false,
          quantity: 1,
        },
        // Always select project documentation bonus
        "bonus-projektova-dokumentace": {
          selected: true,
          quantity: 1,
        },
      })
    }

    if (initialData && initialData.selected_municipality) {
      console.log("Loading selected municipality:", initialData.selected_municipality)
      setSelectedMunicipality(initialData.selected_municipality)
    }

    setDataLoaded(true)
  }, [initialData])

  const calculateItemAmount = (item: SubsidyItem, quantity: number): number => {
    const itemPricing = pricingData[item.name]
    if (!itemPricing) {
      // Fallback to old pricing structure
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

    // Use new pricing structure
    const grant = itemPricing.grant || 0

    // Special handling for rekuperace - fixed grant regardless of quantity
    if (item.name === "Rekuperace") {
      return grant // Always return 90,000 regardless of quantity
    }

    // Special handling for venkovní žaluzie - calculate grant based on window size
    if (item.name === "Venkovní žaluzie") {
      const windowSizeSelection = selections["velikost-oken"]
      const windowSize = windowSizeSelection?.quantity || 0
      if (windowSize > 0) {
        return grant * windowSize // Grant amount multiplied by window size
      }
      return 0 // No grant if no window size specified
    } else if (item.name === "Velikost oken (m²)") {
      // This doesn't contribute to grant amount at all
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

  const calculateItemSurcharge = (item: SubsidyItem, quantity: number): number => {
    const itemPricing = pricingData[item.name]
    if (!itemPricing) {
      return 0
    }

    const surchargeKey = "surchargeUnder400k"
    const surchargeRate = itemPricing[surchargeKey] || 0

    // Special handling for venkovní žaluzie
    if (item.name === "Venkovní žaluzie") {
      const windowSizeSelection = selections["velikost-oken"]
      const windowSize = windowSizeSelection?.quantity || 0
      if (windowSize > 0) {
        // Use the surcharge rate from "Venkovní žaluzie" multiplied by window size
        return surchargeRate * windowSize
      }
      return 0
    } else if (item.name === "Velikost oken (m²)") {
      // This doesn't contribute to surcharge at all
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

  const updateCalculations = async () => {
    const newCategoryTotals: { [key: string]: number } = {}
    let baseTotal = 0
    let baseSurcharge = 0

    // Calculate totals for groups and individual categories
    data.categories.forEach((category) => {
      if (category.isBonus) return

      if (category.isGroup && category.subCategories) {
        // Handle group categories
        let groupTotal = 0
        let groupSurcharge = 0

        category.subCategories.forEach((subCategory) => {
          let subCategoryTotal = 0
          let subCategorySurcharge = 0
          const allItems = [...(subCategory.items || []), ...(subCategory.conditionalItems || [])]

          // Add items from subSections
          if (subCategory.subSections) {
            subCategory.subSections.forEach((subSection) => {
              allItems.push(...(subSection.items || []))
            })
          }

          allItems.forEach((item) => {
            const selection = selections[item.id]

            // For quantity-only items, check if quantity > 0 and parent is selected
            if (item.isQuantityOnly) {
              const parentSelected = item.requiresParent ? selections[item.requiresParent]?.selected : true
              // Only include if parent is actually selected AND quantity > 0
              if (parentSelected && selection?.quantity > 0 && item.requiresParent) {
                const quantity = selection.quantity
                subCategoryTotal += calculateItemAmount(item, quantity)
                subCategorySurcharge += calculateItemSurcharge(item, quantity)
              }
            } else if (selection?.selected) {
              const quantity = selection.quantity || 1
              subCategoryTotal += calculateItemAmount(item, quantity)
              subCategorySurcharge += calculateItemSurcharge(item, quantity)
            }
          })

          // Apply individual category limits (like FVE 140k limit)
          if (subCategory.maxLimit && subCategoryTotal > subCategory.maxLimit) {
            subCategoryTotal = subCategory.maxLimit
          }

          newCategoryTotals[subCategory.id] = subCategoryTotal
          groupTotal += subCategoryTotal
          groupSurcharge += subCategorySurcharge
        })

        // Apply group limits (1M for Group A, 500k for Group B)
        if (category.maxLimit && groupTotal > category.maxLimit) {
          groupTotal = category.maxLimit
        }

        newCategoryTotals[category.id] = groupTotal
        baseTotal += groupTotal
        baseSurcharge += groupSurcharge
      } else {
        // Handle regular categories (like bonuses)
        let categoryTotal = 0
        let categorySurcharge = 0
        const allItems = [...(category.items || []), ...(category.conditionalItems || [])]

        // Add items from subSections
        if (category.subSections) {
          category.subSections.forEach((subSection) => {
            allItems.push(...(subSection.items || []))
          })
        }

        allItems.forEach((item) => {
          const selection = selections[item.id]

          // For quantity-only items, check if quantity > 0 and parent is selected
          if (item.isQuantityOnly) {
            const parentSelected = item.requiresParent ? selections[item.requiresParent]?.selected : true
            // Only include if parent is actually selected AND quantity > 0
            if (parentSelected && selection?.quantity > 0 && item.requiresParent) {
              const quantity = selection.quantity
              categoryTotal += calculateItemAmount(item, quantity)
              categorySurcharge += calculateItemSurcharge(item, quantity)
            }
          } else if (selection?.selected) {
            const quantity = selection.quantity || 1
            categoryTotal += calculateItemAmount(item, quantity)
            categorySurcharge += calculateItemSurcharge(item, quantity)
          }
        })

        // Apply category limits to grants only
        if (category.maxLimit && categoryTotal > category.maxLimit) {
          categoryTotal = category.maxLimit
        }

        newCategoryTotals[category.id] = categoryTotal
        baseTotal += categoryTotal
        baseSurcharge += categorySurcharge
      }
    })

    // Check if insulation is selected (from Group A)
    const hasInsulation = () => {
      return (
        newCategoryTotals["zatepleni-fasady"] > 0 ||
        newCategoryTotals["zatepleni-strechy"] > 0 ||
        newCategoryTotals["zatepleni-stropu"] > 0 ||
        newCategoryTotals["zatepleni-podlahy"] > 0
      )
    }

    // Check if FVE is selected (from Group B)
    const hasFVE = () => {
      return newCategoryTotals["fve"] > 0 || newCategoryTotals["fv-ohrev-vody"] > 0
    }

    // Check if heat pump is selected (from Group B)
    const hasHeatPump = () => {
      return newCategoryTotals["tepelne-cerpadlo"] > 0
    }

    // Auto-select automatic bonuses based on conditions
    const updatedSelections = { ...selections }

    // Always select project documentation bonus
    updatedSelections["bonus-projektova-dokumentace"] = { selected: true, quantity: 1 }

    // Auto-select combination bonuses based on conditions
    if (hasInsulation() && hasFVE()) {
      updatedSelections["bonus-zatepleni-fve"] = { selected: true, quantity: 1 }
    } else {
      updatedSelections["bonus-zatepleni-fve"] = { selected: false, quantity: 1 }
    }

    if (hasInsulation() && hasHeatPump()) {
      updatedSelections["bonus-zatepleni-teplo"] = { selected: true, quantity: 1 }
    } else {
      updatedSelections["bonus-zatepleni-teplo"] = { selected: false, quantity: 1 }
    }

    // Auto-select regional bonus based on municipality selection
    if (selectedMunicipality) {
      updatedSelections["bonus-region"] = { selected: true, quantity: 1 }
    } else {
      updatedSelections["bonus-region"] = { selected: false, quantity: 1 }
    }

    // Update selections if they changed
    if (JSON.stringify(updatedSelections) !== JSON.stringify(selections)) {
      setSelections(updatedSelections)
    }

    // Calculate bonuses separately - they only affect grant amount, not total price
    let bonusGrantAmount = 0
    let bonusPriceAmount = 0 // Only for fixed bonuses that should add to price
    const bonusCategory = data.categories.find((cat) => cat.isBonus)

    if (bonusCategory && bonusCategory.subSections) {
      bonusCategory.subSections.forEach((subSection) => {
        if (subSection.items) {
          subSection.items.forEach((item) => {
            const selection = updatedSelections[item.id]
            if (selection?.selected) {
              if (item.unit === "percent" && item.percentage) {
                // Percentage bonuses only add to grant amount, NOT to total price
                bonusGrantAmount += baseTotal * (item.percentage / 100)
                // Don't add to bonusPriceAmount - percentage bonuses don't increase total price
              } else if (item.unit === "fixed") {
                // Fixed bonuses add to both price and grant
                bonusGrantAmount += item.price
                bonusPriceAmount += item.price
              } else {
                const quantity = selection.quantity || 1
                const bonusAmount = calculateItemAmount(item, quantity)
                bonusGrantAmount += bonusAmount
                bonusPriceAmount += bonusAmount
              }
            }
          })
        }
      })

      newCategoryTotals.bonusy = bonusGrantAmount
    }

    // Calculate excess amounts for groups
    let totalExcess = 0
    data.categories.forEach((category) => {
      if (category.isGroup && category.maxLimit && category.subCategories) {
        let actualGroupTotal = 0

        category.subCategories.forEach((subCategory) => {
          const allItems = [...(subCategory.items || []), ...(subCategory.conditionalItems || [])]

          if (subCategory.subSections) {
            subCategory.subSections.forEach((subSection) => {
              allItems.push(...(subSection.items || []))
            })
          }

          allItems.forEach((item) => {
            const selection = updatedSelections[item.id]

            if (item.isQuantityOnly) {
              const parentSelected = item.requiresParent ? updatedSelections[item.requiresParent]?.selected : true
              // Only include if parent is actually selected AND quantity > 0
              if (parentSelected && selection?.quantity > 0 && item.requiresParent) {
                const quantity = selection.quantity
                actualGroupTotal += calculateItemAmount(item, quantity)
              }
            } else if (selection?.selected) {
              const quantity = selection.quantity || 1
              actualGroupTotal += calculateItemAmount(item, quantity)
            }
          })
        })

        if (actualGroupTotal > category.maxLimit) {
          totalExcess += actualGroupTotal - category.maxLimit
        }
      }
    })

    setCategoryTotals(newCategoryTotals)
    // Total amount should be baseTotal + only fixed bonuses that add to price
    setTotalAmount(baseTotal + bonusPriceAmount)
    setTotalSurcharge(baseSurcharge)
    setExcessAmount(totalExcess)

    // Auto-save for logged-in users (but not new users)
    if (userEmail && !isNewUser) {
      const calculationData = {
        email: userEmail,
        selections: updatedSelections,
        totals: {
          grantAmount: baseTotal + bonusGrantAmount,
          surchargeAmount: baseSurcharge,
          finalAmount: baseTotal + bonusPriceAmount + baseSurcharge,
          excessAmount: totalExcess,
        },
        selectedMunicipality,
      }

      // Save to Supabase (fire and forget - don't wait for result)
      saveCalculation(calculationData).catch((error) => {
        console.error("Auto-save failed:", error)
      })
    }
  }

  useEffect(() => {
    if (dataLoaded) {
      updateCalculations()
    }
  }, [selections, data, pricingData, dataLoaded, implementationSelections, selectedMunicipality])

  // Initialize implementation selections when calculator data changes
  useEffect(() => {
    const newImplementationSelections: { [key: string]: boolean } = {}

    // Get all selected items that are not bonuses and not supplementary
    const selectedItems = getSelectedItemsForImplementation()
    selectedItems.forEach((item) => {
      newImplementationSelections[item.id] = true // Default to checked
    })

    setImplementationSelections(newImplementationSelections)
  }, [selections])

  const getSelectedItemsForImplementation = () => {
    const selectedItems: any[] = []

    allItems.forEach((item) => {
      const selection = selections[item.id]

      // Skip if not selected
      if (!selection?.selected && !(item.isQuantityOnly && selection?.quantity > 0)) {
        return
      }

      // Skip bonus items
      if (item.name.includes("Bonus") || item.name.includes("bonus")) {
        return
      }

      // Skip supplementary items (quantity-only items that require parent)
      if (item.isQuantityOnly && item.requiresParent) {
        return
      }

      // Skip automatic items
      if (item.isAutomatic) {
        return
      }

      selectedItems.push(item)
    })

    return selectedItems
  }

  const handleSelectionChange = (itemId: string, selected: boolean, quantity?: number) => {
    setSelections((prev) => {
      const newSelections = {
        ...prev,
        [itemId]: {
          selected,
          quantity: quantity ?? prev[itemId]?.quantity ?? 1,
        },
      }

      // Auto-select dependent items
      if (itemId === "zpracovani-destove-vody" && selected) {
        newSelections["velikost-nadrze"] = {
          selected: false, // quantity-only items don't need to be "selected"
          quantity: prev["velikost-nadrze"]?.quantity ?? 5,
        }
      } else if (itemId === "zpracovani-destove-vody" && !selected) {
        newSelections["velikost-nadrze"] = {
          selected: false,
          quantity: 0, // Reset quantity when parent is deselected
        }
      }

      // Auto-select dependent items for venkovní žaluzie
      if (itemId === "venkovni-zaluzie" && selected) {
        newSelections["velikost-oken"] = {
          selected: false, // quantity-only items don't need to be "selected"
          quantity: prev["velikost-oken"]?.quantity ?? 1,
        }
      } else if (itemId === "venkovni-zaluzie" && !selected) {
        newSelections["velikost-oken"] = {
          selected: false,
          quantity: 0, // Reset quantity when parent is deselected
        }
      }

      return newSelections
    })
  }

  const handleRadioGroupChange = (groupName: string, selectedItemId: string) => {
    const updatedSelections = { ...selections }

    data.categories.forEach((category) => {
      let allItems: SubsidyItem[] = []

      if (category.isGroup && category.subCategories) {
        category.subCategories.forEach((subCategory) => {
          allItems = [...allItems, ...(subCategory.items || []), ...(subCategory.conditionalItems || [])]

          if (subCategory.subSections) {
            subCategory.subSections.forEach((subSection) => {
              allItems.push(...(subSection.items || []))
            })
          }
        })
      } else {
        allItems = [...(category.items || []), ...(category.conditionalItems || [])]

        if (category.subSections) {
          category.subSections.forEach((subSection) => {
            allItems.push(...(subSection.items || []))
          })
        }
      }

      allItems.forEach((item) => {
        if (item.radioGroup === groupName) {
          if (item.id === selectedItemId) {
            updatedSelections[item.id] = { selected: true, quantity: 1 }
          } else {
            updatedSelections[item.id] = { selected: false, quantity: 1 }
          }
        }
      })
    })

    // Pokud je selectedItemId prázdný, znamená to odvolání výběru
    if (selectedItemId === "") {
      data.categories.forEach((category) => {
        let allItems: SubsidyItem[] = []

        if (category.isGroup && category.subCategories) {
          category.subCategories.forEach((subCategory) => {
            allItems = [...allItems, ...(subCategory.items || []), ...(subCategory.conditionalItems || [])]

            if (subCategory.subSections) {
              subCategory.subSections.forEach((subSection) => {
                allItems.push(...(subSection.items || []))
              })
            }
          })
        } else {
          allItems = [...(category.items || []), ...(category.conditionalItems || [])]

          if (category.subSections) {
            category.subSections.forEach((subSection) => {
              allItems.push(...(subSection.items || []))
            })
          }
        }

        allItems.forEach((item) => {
          if (item.radioGroup === groupName) {
            updatedSelections[item.id] = { selected: false, quantity: 1 }
          }
        })
      })
    }

    // Special handling for heat pump power selection - clear function selection when power is deselected
    if (groupName === "tc-vykon-group" && selectedItemId === "") {
      data.categories.forEach((category) => {
        let allItems: SubsidyItem[] = []

        if (category.isGroup && category.subCategories) {
          category.subCategories.forEach((subCategory) => {
            allItems = [...allItems, ...(subCategory.items || []), ...(subCategory.conditionalItems || [])]

            if (subCategory.subSections) {
              subCategory.subSections.forEach((subSection) => {
                allItems.push(...(subSection.items || []))
              })
            }
          })
        } else {
          allItems = [...(category.items || []), ...(category.conditionalItems || [])]

          if (category.subSections) {
            category.subSections.forEach((subSection) => {
              allItems.push(...(subSection.items || []))
            })
          }
        }

        allItems.forEach((item) => {
          if (item.radioGroup === "tc-funkce-group") {
            updatedSelections[item.id] = { selected: false, quantity: 1 }
          }
        })
      })
    }

    // Auto-select "zapojení do sítě" when any FVE system is selected
    if (groupName === "fve-panely-group" && selectedItemId !== "") {
      updatedSelections["fv-zapojeni"] = { selected: true, quantity: 1 }
    } else if (groupName === "fve-panely-group" && selectedItemId === "") {
      updatedSelections["fv-zapojeni"] = { selected: false, quantity: 1 }
    }

    setSelections(updatedSelections)
  }

  const hasHeatingSelected =
    data.categories.find((cat) => cat.id === "vytapeni")?.items?.some((item) => selections[item.id]?.selected) || false

  const calculatorData = {
    selections,
    totals: {
      grantAmount: totalAmount,
      surchargeAmount: totalSurcharge,
      finalAmount: totalAmount + totalSurcharge,
      excessAmount,
    },
    allItems,
    implementationSelections,
    setImplementationSelections,
    selectedMunicipality,
    setSelectedMunicipality,
  }

  return (
    <div className="space-y-8">
      {data.categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          selections={selections}
          categoryTotal={categoryTotals[category.id] || 0}
          onSelectionChange={handleSelectionChange}
          onRadioGroupChange={handleRadioGroupChange}
          hasHeatingSelected={hasHeatingSelected}
          pricingData={pricingData}
          selectedMunicipality={selectedMunicipality}
          setSelectedMunicipality={setSelectedMunicipality}
        />
      ))}

      <TotalSection totalAmount={totalAmount} excessAmount={excessAmount} />

      <SummaryBox
        grantAmount={totalAmount}
        surchargeAmount={totalSurcharge}
        finalAmount={totalAmount + totalSurcharge}
      />

      <ContactFormOZ
        calculatorData={calculatorData}
        districts={districts}
        userEmail={userEmail}
        initialContactData={initialData?.contact_form}
        isNewUser={isNewUser}
        pricingData={pricingData}
      />
    </div>
  )
}
