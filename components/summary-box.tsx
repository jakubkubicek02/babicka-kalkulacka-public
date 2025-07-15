"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryBoxProps {
  grantAmount: number
  surchargeAmount: number
  finalAmount: number
}

export function SummaryBox({ grantAmount, surchargeAmount, finalAmount }: SummaryBoxProps) {
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("cs-CZ") + " Kč"
  }

  return (
    <Card className="w-full max-w-none mx-0 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-exo text-green-700 text-center">Celkový přehled kalkulace</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white rounded-lg border border-green-100 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-2">Celková dotace</div>
            <div className="text-2xl font-bold text-green-700">{formatAmount(grantAmount)}</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-2">Váš doplatek</div>
            <div className="text-2xl font-bold text-blue-700">{formatAmount(surchargeAmount)}</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-2">Celková cena</div>
            <div className="text-2xl font-bold text-purple-700">{formatAmount(finalAmount)}</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-sm font-medium text-green-800 mb-1">Úspora díky dotaci</div>
            <div className="text-xl font-bold text-green-900">
              {formatAmount(grantAmount)} ({Math.round((grantAmount / finalAmount) * 100)}%)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
