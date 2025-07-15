"use client"

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

interface SubsidyItemProps {
  item: SubsidyItemType
  selection: Selection
  onSelectionChange: (itemId: string, selected: boolean, quantity?: number) => void
  onRadioGroupChange: (groupName: string, selectedItemId: string) => void
  disabled: boolean
  pricingData: { [key: string]: any }
  parentSelected?: boolean
  isInBonusSection?: boolean
}

export function SubsidyItem({
  item,
  selection,
  onSelectionChange,
  onRadioGroupChange,
  disabled,
  pricingData,
  parentSelected = false,
  isInBonusSection = false,
}: SubsidyItemProps) {
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

  // Get display name from pricing data or fall back to item name
  const getDisplayName = () => {
    const itemPricing = pricingData[item.name]
    return itemPricing?.displayName || item.name
  }

  const getPricingInfo = () => {
    const itemPricing = pricingData[item.name]
    if (!itemPricing) {
      // Fallback to old pricing structure
      return {
        grant: item.price,
        price: item.price,
        surcharge: 0,
      }
    }

    const priceKey = "priceUnder400k"
    const surchargeKey = "surchargeUnder400k"

    const grant = itemPricing.grant || 0
    const price = itemPricing[priceKey] || itemPricing.grant || 0
    const surcharge = itemPricing[surchargeKey] || 0

    // Special handling for venkovní žaluzie - calculate based on window size
    if (item.name === "Venkovní žaluzie") {
      // For display purposes, we'll show per unit price
      return {
        grant: grant, // Show per unit price
        price: price,
        surcharge: surcharge,
      }
    }

    return {
      grant: grant,
      price: price,
      surcharge: surcharge,
    }
  }

  const getPriceDisplay = () => {
    // Hide price display for items marked as hidePrice
    if (item.hidePrice) {
      return null
    }

    const { grant, price, surcharge } = getPricingInfo()
    const unitDisplay = getUnitDisplay(item.unit)

    if (item.isQuantityOnly) {
      // For quantity-only items, show price per unit
      if (isInBonusSection) {
        // In bonus section, don't show surcharge info
        return (
          <div className="text-right min-w-0 sm:min-w-[200px] flex-shrink-0">
            <div className="text-lg font-bold text-green-700">
              Dotace: {formatAmount(grant)} {unitDisplay}
            </div>
          </div>
        )
      } else {
        return (
          <div className="text-right min-w-0 sm:min-w-[200px] flex-shrink-0">
            <div className="text-sm font-medium text-black">
              Dotace: {formatAmount(grant)} {unitDisplay}
            </div>
            <div className="text-sm text-black">
              Doplatek: {formatAmount(surcharge)} {unitDisplay}
            </div>
            <div className="text-lg border-t border-gray-200 pt-1 text-green-700 font-extrabold">
              Cena: {formatAmount(price)} {unitDisplay}
            </div>
          </div>
        )
      }
    } else if (item.unit === "fixed") {
      if (isInBonusSection) {
        // In bonus section, only show grant amount
        return (
          <div className="text-right min-w-0 sm:min-w-[200px] flex-shrink-0">
            <div className="text-lg font-bold text-green-700">Dotace: {formatAmount(grant)}</div>
          </div>
        )
      } else {
        return (
          <div className="text-right min-w-0 sm:min-w-[200px] flex-shrink-0">
            <div className="text-sm font-medium text-black">Dotace: {formatAmount(grant)}</div>
            {surcharge > 0 && <div className="text-sm text-black">Doplatek: {formatAmount(surcharge)}</div>}
            {surcharge > 0 && (
              <div className="text-lg font-bold border-t border-gray-200 pt-1 text-green-700">
                Cena: {formatAmount(price)}
              </div>
            )}
          </div>
        )
      }
    } else if (item.unit === "percent") {
      return (
        <div className="text-right min-w-0 sm:min-w-[120px] flex-shrink-0">
          <div className="text-lg font-bold text-green-700">{item.percentage}%</div>
        </div>
      )
    } else if (item.maxAmount) {
      return (
        <div className="text-right min-w-0 sm:min-w-[120px] flex-shrink-0">
          <div className="text-lg font-bold text-green-700">Max {formatAmount(item.maxAmount)}</div>
        </div>
      )
    } else {
      if (isInBonusSection) {
        // In bonus section, don't show surcharge info
        return (
          <div className="text-right min-w-0 sm:min-w-[200px] flex-shrink-0">
            <div className="text-lg font-bold text-green-700">
              Dotace: {formatAmount(grant)} {unitDisplay}
            </div>
          </div>
        )
      } else {
        // Special handling for rekuperace - show like other items
        if (item.name === "Rekuperace") {
          const quantity = selection.quantity || 1
          const totalCost = surcharge * quantity // 40,000 × quantity
          const actualSurcharge = Math.max(0, totalCost - grant) // max(0, totalCost - 90,000)

          return (
            <div className="text-right min-w-0 sm:min-w-[200px] flex-shrink-0">
              <div className="text-sm font-medium text-black">Dotace: {formatAmount(grant)} (fixní)</div>
              <div className="text-sm text-black">Doplatek: {formatAmount(actualSurcharge)}</div>
              <div className="text-lg border-t border-gray-200 pt-1 text-green-700 font-extrabold">
                Cena: {formatAmount(totalCost)}
              </div>
            </div>
          )
        } else {
          return (
            <div className="text-right min-w-0 sm:min-w-[200px] flex-shrink-0">
              <div className="text-sm font-medium text-black">
                Dotace: {formatAmount(grant)} {unitDisplay}
              </div>
              <div className="text-sm text-black">
                Doplatek: {formatAmount(surcharge)} {unitDisplay}
              </div>
              <div className="text-lg border-t border-gray-200 pt-1 text-green-700 font-extrabold">
                Cena: {formatAmount(price)} {unitDisplay}
              </div>
            </div>
          )
        }
      }
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    // Don't allow changes for automatic bonuses
    if (item.isAutomatic) {
      return
    }

    if (item.radioGroup) {
      if (checked) {
        onRadioGroupChange(item.radioGroup, item.id)
      } else {
        // Pokud je již vybrané a uživatel klikne znovu, odvolej výběr
        onRadioGroupChange(item.radioGroup, "")
      }
    } else {
      onSelectionChange(item.id, checked)
    }
  }

  const handleQuantityChange = (quantity: number) => {
    // Don't allow changes for automatic bonuses
    if (item.isAutomatic) {
      return
    }

    // Enforce minimum value
    const minValue = item.min || 0
    const finalQuantity = Math.max(quantity, minValue)

    if (item.isQuantityOnly) {
      // For quantity-only items, just update quantity without changing selection
      onSelectionChange(item.id, parentSelected, finalQuantity)
    } else {
      onSelectionChange(item.id, selection.selected, finalQuantity)
    }
  }

  const handleQuantityFocus = () => {
    if (!item.isQuantityOnly && !selection.selected && !item.isAutomatic) {
      handleCheckboxChange(true)
    }
  }

  const isItemDisabled = disabled || (item.requiresParent && !parentSelected) || item.isAutomatic

  const itemClasses = isItemDisabled
    ? "opacity-50 pointer-events-none bg-gray-100"
    : "bg-white hover:border-green-700 hover:-translate-y-0.5 hover:shadow-lg"

  // Special styling for automatic bonuses
  const automaticItemClasses = item.isAutomatic
    ? "bg-green-50 border-green-200"
    : "bg-white hover:border-green-700 hover:-translate-y-0.5 hover:shadow-lg"

  // For quantity-only items, show different layout
  if (item.isQuantityOnly) {
    return (
      <div className={`p-4 rounded-lg border border-gray-200 transition-all duration-200 ${itemClasses}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-gray-700 font-normal flex-1">{getDisplayName()}</span>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:ml-auto">
            <input
              type="number"
              min={item.min || 0}
              step={item.step || 1}
              max={item.max}
              value={selection.quantity}
              onChange={(e) => handleQuantityChange(Number.parseFloat(e.target.value) || item.min || 0)}
              placeholder={getUnitDisplay(item.unit)}
              disabled={isItemDisabled}
              className="w-full sm:w-20 px-3 py-2 border-2 border-gray-200 rounded-md text-center font-medium transition-all duration-200 focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />

            {getPriceDisplay()}
          </div>
        </div>
      </div>
    )
  }

  // Regular items with checkbox
  return (
    <div
      className={`p-4 rounded-lg border border-gray-200 transition-all duration-200 ${item.isAutomatic ? automaticItemClasses : itemClasses}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="flex items-center flex-1 cursor-pointer">
          <input
            type="checkbox"
            checked={selection.selected}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            disabled={isItemDisabled}
            className={`w-5 h-5 mr-3 accent-green-700 ${item.isAutomatic ? "cursor-not-allowed" : "cursor-pointer"}`}
          />
          <span className={`font-normal flex-1 ${item.isAutomatic ? "text-green-700" : "text-gray-700"}`}>
            {getDisplayName()}
            {item.isAutomatic && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Automatický</span>
            )}
          </span>
        </label>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:ml-auto">
          {item.hasQuantity && (
            <input
              type="number"
              min={item.min || 0}
              step={item.step || 1}
              max={item.max}
              value={selection.quantity}
              onChange={(e) => handleQuantityChange(Number.parseFloat(e.target.value) || item.min || 0)}
              onFocus={handleQuantityFocus}
              placeholder={getUnitDisplay(item.unit)}
              disabled={isItemDisabled}
              className="w-full sm:w-20 px-3 py-2 border-2 border-gray-200 rounded-md text-center font-medium transition-all duration-200 focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
          )}

          {getPriceDisplay()}
        </div>
      </div>
    </div>
  )
}
