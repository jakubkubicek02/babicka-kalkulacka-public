"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Edit, Save, X, Search } from "lucide-react"
import { loadPricingData, updatePricingItem } from "@/lib/pricing"

interface PricingAdminProps {
  isVisible: boolean
  onClose: () => void
}

export function PricingAdmin({ isVisible, onClose }: PricingAdminProps) {
  const [pricingItems, setPricingItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editForm, setEditForm] = useState<any>({
    display_name: "",
    webhook_name: "",
  })
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    if (isVisible) {
      loadData()
    }
  }, [isVisible])

  useEffect(() => {
    // Filter items based on search term
    if (searchTerm.trim() === "") {
      setFilteredItems(pricingItems)
    } else {
      const filtered = pricingItems.filter(
        (item) =>
          (item.display_name || item.item_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.webhook_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredItems(filtered)
    }
  }, [searchTerm, pricingItems])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await loadPricingData()
      if (result.success && result.data) {
        // Convert to array format for easier editing
        const items = Object.entries(result.data).map(([name, data]) => ({
          item_name: name,
          display_name: data.displayName || name,
          grant_amount: data.grant,
          price_under_400k: data.priceUnder400k,
          surcharge_under_400k: data.surchargeUnder400k,
          price_over_400k: data.priceOver400k,
          surcharge_over_400k: data.surchargeOver400k,
          is_per_square_meter: data.isPerSquareMeter || false,
          webhook_name: data.webhookName || name,
        }))

        // Sort items alphabetically by display name
        items.sort((a, b) => (a.display_name || a.item_name).localeCompare(b.display_name || b.item_name))

        setPricingItems(items)
        setFilteredItems(items)
      }
    } catch (error) {
      console.error("Error loading pricing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (itemName: string) => {
    const item = pricingItems.find((p) => p.item_name === itemName)
    if (item) {
      setEditingItem(itemName)
      setEditForm({
        ...item,
        display_name: item.display_name || item.item_name,
        webhook_name: item.webhook_name || item.item_name,
      })
    }
  }

  const handleSave = async () => {
    if (!editingItem) return

    try {
      const result = await updatePricingItem(editingItem, {
        display_name: editForm.display_name || editForm.item_name,
        grant_amount: Number.parseFloat(editForm.grant_amount) || 0,
        price_under_400k: Number.parseFloat(editForm.price_under_400k) || 0,
        surcharge_under_400k: Number.parseFloat(editForm.surcharge_under_400k) || 0,
        price_over_400k: Number.parseFloat(editForm.price_over_400k) || 0,
        surcharge_over_400k: Number.parseFloat(editForm.surcharge_over_400k) || 0,
        is_per_square_meter: editForm.is_per_square_meter,
        webhook_name: editForm.webhook_name || editForm.display_name || editForm.item_name,
      })

      if (result.success) {
        setSaveStatus("success")
        setSaveMessage("Položka byla úspěšně aktualizována")
        setEditingItem(null)
        loadData() // Reload data

        // Trigger a page refresh to update the calculator
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setSaveStatus("error")
        setSaveMessage(result.error || "Chyba při ukládání")
      }
    } catch (error) {
      setSaveStatus("error")
      setSaveMessage("Neočekávaná chyba při ukládání")
    }

    // Clear status after 3 seconds
    setTimeout(() => {
      setSaveStatus(null)
      setSaveMessage("")
    }, 3000)
  }

  const handleCancel = () => {
    setEditingItem(null)
    setEditForm({})
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("cs-CZ")
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-exo text-green-700">Správa cen</CardTitle>
              <CardDescription>
                Upravte cenové údaje a názvy pro kalkulačku ({filteredItems.length} položek)
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="overflow-auto max-h-[calc(90vh-120px)]">
            {/* Search bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Hledat položky..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {saveStatus && (
              <Alert
                className={`mb-4 ${saveStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                {saveStatus === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={saveStatus === "success" ? "text-green-800" : "text-red-800"}>
                  {saveMessage}
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p>Načítání cenových dat...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Žádné položky nenalezeny pro hledaný výraz "{searchTerm}"</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item.item_name} className="border rounded-lg p-4">
                      {editingItem === item.item_name ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label>Název v kalkulačce *</Label>
                              <Input
                                value={editForm.display_name || ""}
                                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                                placeholder="Název který se zobrazí v kalkulačce"
                              />
                              <p className="text-xs text-gray-500 mt-1">Systémový název: {item.item_name}</p>
                            </div>
                            <div>
                              <Label>Název pro webhook</Label>
                              <Input
                                value={editForm.webhook_name || ""}
                                onChange={(e) => setEditForm({ ...editForm, webhook_name: e.target.value })}
                                placeholder="Název který se pošle na webhook"
                              />
                            </div>
                            <div>
                              <Label>Dotace (Kč)</Label>
                              <Input
                                type="number"
                                value={editForm.grant_amount || ""}
                                onChange={(e) => setEditForm({ ...editForm, grant_amount: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Cena pod 400k (Kč)</Label>
                              <Input
                                type="number"
                                value={editForm.price_under_400k || ""}
                                onChange={(e) => setEditForm({ ...editForm, price_under_400k: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Doplatek pod 400k (Kč)</Label>
                              <Input
                                type="number"
                                value={editForm.surcharge_under_400k || ""}
                                onChange={(e) => setEditForm({ ...editForm, surcharge_under_400k: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`per-meter-${item.item_name}`}
                              checked={editForm.is_per_square_meter || false}
                              onChange={(e) => setEditForm({ ...editForm, is_per_square_meter: e.target.checked })}
                            />
                            <Label htmlFor={`per-meter-${item.item_name}`}>Cena za m²</Label>
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={handleSave} className="bg-green-700 hover:bg-green-800">
                              <Save className="w-4 h-4 mr-2" />
                              Uložit
                            </Button>
                            <Button variant="outline" onClick={handleCancel}>
                              Zrušit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{item.display_name || item.item_name}</h3>
                              {item.display_name !== item.item_name && (
                                <p className="text-sm text-gray-500">Systémový název: {item.item_name}</p>
                              )}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(item.item_name)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Dotace:</span>
                              <br />
                              {formatAmount(item.grant_amount)} Kč
                            </div>
                            <div>
                              <span className="font-medium">Cena pod 400k:</span>
                              <br />
                              {formatAmount(item.price_under_400k)} Kč
                            </div>
                            <div>
                              <span className="font-medium">Doplatek pod 400k:</span>
                              <br />
                              {formatAmount(item.surcharge_under_400k)} Kč
                            </div>
                            <div>
                              <span className="font-medium">Webhook název:</span>
                              <br />
                              <span className="text-blue-600">
                                {item.webhook_name || item.display_name || item.item_name}
                              </span>
                            </div>
                          </div>
                          {item.is_per_square_meter && (
                            <div className="mt-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Cena za m²
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
