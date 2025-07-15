"use client"

interface TotalSectionProps {
  totalAmount: number
  excessAmount: number
}

export function TotalSection({ totalAmount, excessAmount }: TotalSectionProps) {
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("cs-CZ") + " Kč"
  }

  return (
    <div className="mt-10 p-7 bg-gradient-to-br from-green-700 to-green-600 text-white rounded-xl text-center shadow-2xl">
      <h2 className="text-xl font-semibold mb-2 opacity-90">Celková výše dotace</h2>
      <div className="text-4xl md:text-5xl font-bold font-exo mb-2 drop-shadow-sm">
        {formatAmount(Math.round(totalAmount))}
      </div>
    </div>
  )
}
