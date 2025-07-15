"use client"

import { MunicipalitySearch } from "./municipality-search"
import { useState, useEffect } from "react"
import { loadMunicipalities } from "@/lib/municipalities"
import { SubsidyItem } from "./subsidy-item"

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

interface SubsidyItemType {
  id: string
  name: string
  price: number
  price2?: number
  unit: string
  hasQuantity: boolean
  step?: number
  maxAmount?: number
  max?: number
  min?: number
  percentage?: number
  requiresCondition?: boolean
  radioGroup?: string
  isQuantityOnly?: boolean
  requiresParent?: string
  isAutomatic?: boolean
  alwaysSelected?: boolean
  hidePrice?: boolean
}

interface Selection {
  selected: boolean
  quantity: number
}

interface CategorySectionProps {
  category: Category
  selections: { [itemId: string]: Selection }
  categoryTotal: number
  onSelectionChange: (itemId: string, selected: boolean, quantity?: number) => void
  onRadioGroupChange: (groupName: string, selectedItemId: string) => void
  hasHeatingSelected: boolean
  pricingData: { [key: string]: any }
  selectedMunicipality?: string
  setSelectedMunicipality?: (municipality: string) => void
}

export function CategorySection({
  category,
  selections,
  categoryTotal,
  onSelectionChange,
  onRadioGroupChange,
  hasHeatingSelected,
  pricingData,
  selectedMunicipality,
  setSelectedMunicipality,
}: CategorySectionProps) {
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("cs-CZ") + " Kč"
  }

  const [municipalities, setMunicipalities] = useState<string[]>([])

  // Load municipalities data
  useEffect(() => {
    loadMunicipalities().then((data) => {
      setMunicipalities(data.municipalities)
    })
  }, [])

  // Calculate category surcharge total including subSections and subCategories
  const calculateCategorySurcharge = () => {
    let totalSurcharge = 0
    let allItems: SubsidyItemType[] = []

    if (category.isGroup && category.subCategories) {
      // Handle group categories
      category.subCategories.forEach((subCategory) => {
        allItems = [...allItems, ...(subCategory.items || []), ...(subCategory.conditionalItems || [])]

        if (subCategory.subSections) {
          subCategory.subSections.forEach((subSection) => {
            allItems.push(...(subSection.items || []))
          })
        }
      })
    } else {
      // Handle regular categories
      allItems = [...(category.items || []), ...(category.conditionalItems || [])]

      if (category.subSections) {
        category.subSections.forEach((subSection) => {
          allItems.push(...(subSection.items || []))
        })
      }
    }

    allItems.forEach((item) => {
      const selection = selections[item.id]

      // For quantity-only items, ONLY calculate if parent is selected
      if (item.isQuantityOnly) {
        if (item.requiresParent) {
          const parentSelected = selections[item.requiresParent]?.selected || false
          if (parentSelected && selection?.quantity > 0) {
            const quantity = selection.quantity
            const itemPricing = pricingData[item.name]

            if (itemPricing) {
              const surchargeKey = "surchargeUnder400k"
              const surchargeRate = itemPricing[surchargeKey] || 0
              totalSurcharge += surchargeRate * quantity
            }
          }
        }
        // Skip quantity-only items without parent requirement
        return
      }

      // For regular selected items
      if (selection?.selected) {
        const quantity = selection.quantity || 1
        const itemPricing = pricingData[item.name]

        if (itemPricing) {
          const surchargeKey = "surchargeUnder400k"
          const surchargeRate = itemPricing[surchargeKey] || 0

          // Special handling for rekuperace
          if (item.name === "Rekuperace") {
            const totalCost = surchargeRate * quantity // 40,000 × quantity
            const grant = itemPricing.grant || 0 // 90,000
            const actualSurcharge = Math.max(0, totalCost - grant) // max(0, totalCost - 90,000)
            totalSurcharge += actualSurcharge
          }
          // Special handling for venkovní žaluzie
          else if (item.name === "Venkovní žaluzie") {
            const windowSizeSelection = selections["velikost-oken"]
            const windowSize = windowSizeSelection?.quantity || 0
            if (windowSize > 0) {
              // Use the pricing from "Venkovní žaluzie", not "Velikost oken"
              totalSurcharge += surchargeRate * windowSize
            }
          } else if (item.name === "Velikost oken (m²)") {
            // Skip this completely - it doesn't contribute to surcharge
            return
          } else if (item.unit === "fixed") {
            totalSurcharge += surchargeRate
          } else if (item.unit !== "percent") {
            totalSurcharge += surchargeRate * quantity
          }
        }
      }
    })

    return totalSurcharge
  }

  // Calculate category total cost (for final price display)
  const calculateCategoryTotalCost = () => {
    let totalCost = 0
    let allItems: SubsidyItemType[] = []

    if (category.isGroup && category.subCategories) {
      // Handle group categories
      category.subCategories.forEach((subCategory) => {
        allItems = [...allItems, ...(subCategory.items || []), ...(subCategory.conditionalItems || [])]

        if (subCategory.subSections) {
          subCategory.subSections.forEach((subSection) => {
            allItems.push(...(subSection.items || []))
          })
        }
      })
    } else {
      // Handle regular categories
      allItems = [...(category.items || []), ...(category.conditionalItems || [])]

      if (category.subSections) {
        category.subSections.forEach((subSection) => {
          allItems.push(...(subSection.items || []))
        })
      }
    }

    allItems.forEach((item) => {
      const selection = selections[item.id]

      // For quantity-only items, ONLY calculate if parent is selected
      if (item.isQuantityOnly) {
        if (item.requiresParent) {
          const parentSelected = selections[item.requiresParent]?.selected || false
          if (parentSelected && selection?.quantity > 0) {
            const quantity = selection.quantity
            const itemPricing = pricingData[item.name]

            if (itemPricing) {
              const priceKey = "priceUnder400k"
              const price = itemPricing[priceKey] || itemPricing.grant || 0
              totalCost += price * quantity
            }
          }
        }
        // Skip quantity-only items without parent requirement
        return
      }

      // For regular selected items
      if (selection?.selected) {
        const quantity = selection.quantity || 1
        const itemPricing = pricingData[item.name]

        if (itemPricing) {
          const surchargeKey = "surchargeUnder400k"
          const surchargeRate = itemPricing[surchargeKey] || 0

          // Special handling for rekuperace
          if (item.name === "Rekuperace") {
            const totalItemCost = surchargeRate * quantity // 40,000 × quantity
            totalCost += totalItemCost
          }
          // Special handling for venkovní žaluzie
          else if (item.name === "Venkovní žaluzie") {
            const windowSizeSelection = selections["velikost-oken"]
            const windowSize = windowSizeSelection?.quantity || 0
            if (windowSize > 0) {
              const priceKey = "priceUnder400k"
              const price = itemPricing[priceKey] || 0
              totalCost += price * windowSize
            }
          } else if (item.name === "Velikost oken (m²)") {
            // Skip this completely
            return
          } else if (item.unit === "fixed") {
            const priceKey = "priceUnder400k"
            const price = itemPricing[priceKey] || itemPricing.grant || 0
            totalCost += price
          } else if (item.unit !== "percent") {
            const priceKey = "priceUnder400k"
            const price = itemPricing[priceKey] || itemPricing.grant || 0
            totalCost += price * quantity
          }
        }
      }
    })

    return totalCost
  }

  const categorySurcharge = calculateCategorySurcharge()
  const categoryTotalCost = calculateCategoryTotalCost()

  const categoryClasses = category.isBonus
    ? "bg-yellow-50 border-2 border-yellow-300"
    : category.isGroup
      ? "bg-blue-50 border-2 border-blue-300"
      : "bg-gray-50 border border-gray-200"

  const totalBadgeClasses = category.isBonus ? "bg-yellow-500" : category.isGroup ? "bg-blue-700" : "bg-green-700"

  // Check if parent is selected for dependent items
  const isParentSelected = (parentId: string) => {
    return selections[parentId]?.selected || false
  }

  // Check if any item from a radio group is selected
  const isRadioGroupSelected = (radioGroupName: string) => {
    let allItems: SubsidyItemType[] = []

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

    return allItems.some((item) => item.radioGroup === radioGroupName && selections[item.id]?.selected)
  }

  // Check if heat pump power is selected (for tc-funkce-group dependency)
  const isHeatPumpPowerSelected = isRadioGroupSelected("tc-vykon-group")

  // For bonus section, reorganize items
  if (category.isBonus) {
    // Collect all items from subsections
    const allBonusItems: SubsidyItemType[] = []
    const manualItems: SubsidyItemType[] = []
    const automaticItems: SubsidyItemType[] = []

    // Add items from main category
    if (category.items) {
      allBonusItems.push(...category.items)
    }

    // Add items from subsections
    if (category.subSections) {
      category.subSections.forEach((subSection) => {
        allBonusItems.push(...(subSection.items || []))
      })
    }

    // Separate manual and automatic items
    allBonusItems.forEach((item) => {
      if (item.isAutomatic) {
        automaticItems.push(item)
      } else {
        manualItems.push(item)
      }
    })

    // Combine: manual first, then automatic
    const orderedItems = [...manualItems, ...automaticItems]

    return (
      <div className={`p-6 rounded-xl transition-all duration-300 hover:shadow-md ${categoryClasses}`}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 gap-2">
          <h2 className="font-exo text-green-700 text-xl md:text-2xl font-semibold">{category.name}</h2>
          <div
            className={`${totalBadgeClasses} text-white px-4 py-2 rounded-full text-xs font-medium self-start md:self-auto max-w-full`}
          >
            <div className="text-center">
              <div>Dotace: {formatAmount(categoryTotal)}</div>
            </div>
          </div>
        </div>

        {category.info && <p className="text-gray-600 text-sm italic mb-4 font-light">{category.info}</p>}

        <div className="space-y-4">
          {orderedItems.map((item) => {
            // Special handling for regional bonus - show municipality search
            if (item.id === "bonus-region") {
              return (
                <div key={item.id} className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selectedMunicipality}
                        readOnly
                        disabled
                        className="w-5 h-5 accent-green-700 cursor-not-allowed opacity-50"
                      />
                      <span className="text-gray-700 font-normal flex-1">{item.name}</span>
                    </div>
                    <div className="text-right min-w-0 sm:min-w-[200px] flex-shrink-0">
                      <div className="text-lg font-bold text-green-700">
                        {selectedMunicipality ? `${item.percentage}%` : "0%"}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <MunicipalitySearch
                      selectedMunicipality={selectedMunicipality || ""}
                      onMunicipalityChange={setSelectedMunicipality || (() => {})}
                      municipalities={municipalities}
                    />

                    {selectedMunicipality && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800 font-medium">
                          ✅ Vybraná obec: <strong>{selectedMunicipality}</strong>
                        </p>
                        <p className="text-xs text-green-600 mt-1">Bonus {item.percentage}% z celkové výše podpory</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <SubsidyItem
                key={item.id}
                item={item}
                selection={selections[item.id] || { selected: false, quantity: 1 }}
                onSelectionChange={onSelectionChange}
                onRadioGroupChange={onRadioGroupChange}
                disabled={false}
                pricingData={pricingData}
                parentSelected={item.requiresParent ? isParentSelected(item.requiresParent) : true}
                isInBonusSection={true}
              />
            )
          })}
        </div>
      </div>
    )
  }

  // Group category display
  if (category.isGroup && category.subCategories) {
    return (
      <div className={`p-6 rounded-xl transition-all duration-300 hover:shadow-md ${categoryClasses}`}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 gap-2">
          <h2 className="font-exo text-blue-700 text-xl md:text-2xl font-semibold">{category.name}</h2>
          <div
            className={`${totalBadgeClasses} text-white px-4 py-2 rounded-full text-xs font-medium self-start md:self-auto max-w-full`}
          >
            <div className="text-center">
              <div>Dotace: {formatAmount(categoryTotal)}</div>
              <div>Doplatek: {formatAmount(categorySurcharge)}</div>
              <div className="border-t border-white/30 pt-1 mt-1 font-semibold">
                Cena: {formatAmount(categoryTotalCost)}
              </div>
            </div>
          </div>
        </div>

        {category.maxLimit && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white bg-blue-600">
              Maximální dotace pro {category.name.toLowerCase()}: {formatAmount(category.maxLimit)}
            </span>
          </div>
        )}

        {category.info && <p className="text-gray-600 text-sm italic mb-4 font-light">{category.info}</p>}

        <div className="space-y-6">
          {category.subCategories.map((subCategory) => (
            <div key={subCategory.id} className="border-l-4 border-blue-300 pl-6">
              <h3 className="font-exo text-blue-600 text-lg font-semibold mb-4">{subCategory.name}</h3>

              {subCategory.maxLimit && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-100">
                    Max: {formatAmount(subCategory.maxLimit)}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {(subCategory.items || []).map((item) => (
                  <SubsidyItem
                    key={item.id}
                    item={item}
                    selection={selections[item.id] || { selected: false, quantity: 1 }}
                    onSelectionChange={onSelectionChange}
                    onRadioGroupChange={onRadioGroupChange}
                    disabled={false}
                    pricingData={pricingData}
                    parentSelected={item.requiresParent ? isParentSelected(item.requiresParent) : true}
                    isInBonusSection={false}
                  />
                ))}

                {subCategory.subSections && (
                  <div className="mt-6 space-y-6">
                    {subCategory.subSections.map((subSection) => (
                      <div key={subSection.id} className="border-t-2 border-dashed border-gray-300 pt-6">
                        <h4 className="font-exo text-green-700 text-lg font-semibold mb-4">{subSection.name}</h4>
                        <div className="space-y-4">
                          {(subSection.items || []).map((item) => {
                            // Special handling for heat pump function group - requires power selection
                            const isDisabled = item.radioGroup === "tc-funkce-group" ? !isHeatPumpPowerSelected : false
                            const parentSelected = item.requiresParent ? isParentSelected(item.requiresParent) : true

                            return (
                              <SubsidyItem
                                key={item.id}
                                item={item}
                                selection={selections[item.id] || { selected: false, quantity: 1 }}
                                onSelectionChange={onSelectionChange}
                                onRadioGroupChange={onRadioGroupChange}
                                disabled={isDisabled}
                                pricingData={pricingData}
                                parentSelected={parentSelected}
                                isInBonusSection={false}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {subCategory.conditionalItems && (
                  <div className="mt-5 pt-5 border-t-2 border-dashed border-gray-300">
                    <p className="text-gray-600 text-sm italic mb-4 font-light">
                      Následující možnosti jsou dostupné pouze pokud nevyberete vytápění s ohřevem vody:
                    </p>
                    {subCategory.conditionalItems.map((item) => (
                      <SubsidyItem
                        key={item.id}
                        item={item}
                        selection={selections[item.id] || { selected: false, quantity: 1 }}
                        onSelectionChange={onSelectionChange}
                        onRadioGroupChange={onRadioGroupChange}
                        disabled={hasHeatingSelected}
                        pricingData={pricingData}
                        parentSelected={item.requiresParent ? isParentSelected(item.requiresParent) : true}
                        isInBonusSection={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Regular category display
  return (
    <div className={`p-6 rounded-xl transition-all duration-300 hover:shadow-md ${categoryClasses}`}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 gap-2">
        <h2 className="font-exo text-green-700 text-xl md:text-2xl font-semibold">{category.name}</h2>
        <div
          className={`${totalBadgeClasses} text-white px-4 py-2 rounded-full text-xs font-medium self-start md:self-auto max-w-full`}
        >
          <div className="text-center">
            <div>Dotace: {formatAmount(categoryTotal)}</div>
            <div>Doplatek: {formatAmount(categorySurcharge)}</div>
            <div className="border-t border-white/30 pt-1 mt-1 font-semibold">
              Cena: {formatAmount(categoryTotalCost)}
            </div>
          </div>
        </div>
      </div>

      {category.maxLimit && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-black bg-slate-300">
            Maximální dotace pro {category.name.toLowerCase()}: {formatAmount(category.maxLimit)}
          </span>
        </div>
      )}

      {category.info && <p className="text-gray-600 text-sm italic mb-4 font-light">{category.info}</p>}

      <div className="space-y-4">
        {(category.items || []).map((item) => (
          <SubsidyItem
            key={item.id}
            item={item}
            selection={selections[item.id] || { selected: false, quantity: 1 }}
            onSelectionChange={onSelectionChange}
            onRadioGroupChange={onRadioGroupChange}
            disabled={false}
            pricingData={pricingData}
            parentSelected={item.requiresParent ? isParentSelected(item.requiresParent) : true}
            isInBonusSection={false}
          />
        ))}

        {category.subSections && (
          <div className="mt-6 space-y-6">
            {category.subSections.map((subSection) => (
              <div key={subSection.id} className="border-t-2 border-dashed border-gray-300 pt-6">
                <h4 className="font-exo text-green-700 text-lg font-semibold mb-4">{subSection.name}</h4>
                <div className="space-y-4">
                  {(subSection.items || []).map((item) => {
                    // Special handling for heat pump function group - requires power selection
                    const isDisabled = item.radioGroup === "tc-funkce-group" ? !isHeatPumpPowerSelected : false
                    const parentSelected = item.requiresParent ? isParentSelected(item.requiresParent) : true

                    return (
                      <SubsidyItem
                        key={item.id}
                        item={item}
                        selection={selections[item.id] || { selected: false, quantity: 1 }}
                        onSelectionChange={onSelectionChange}
                        onRadioGroupChange={onRadioGroupChange}
                        disabled={isDisabled}
                        pricingData={pricingData}
                        parentSelected={parentSelected}
                        isInBonusSection={false}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {category.conditionalItems && (
          <div className="mt-5 pt-5 border-t-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-sm italic mb-4 font-light">
              Následující možnosti jsou dostupné pouze pokud nevyberete vytápění s ohřevem vody:
            </p>
            {category.conditionalItems.map((item) => (
              <SubsidyItem
                key={item.id}
                item={item}
                selection={selections[item.id] || { selected: false, quantity: 1 }}
                onSelectionChange={onSelectionChange}
                onRadioGroupChange={onRadioGroupChange}
                disabled={hasHeatingSelected}
                pricingData={pricingData}
                parentSelected={item.requiresParent ? isParentSelected(item.requiresParent) : true}
                isInBonusSection={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
