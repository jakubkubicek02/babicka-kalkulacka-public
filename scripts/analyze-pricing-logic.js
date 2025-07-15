// Analyze the pricing CSV to understand the correct structure
async function analyzePricingLogic() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kalkulacka_ceny_9.7.25-YB1zGckH3xfUbNKXFT14vVeZU3w6Ck.csv",
    )
    const csvText = await response.text()

    console.log("Raw CSV Content:")
    console.log(csvText)

    // Parse CSV manually
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("Headers:", headers)

    const data = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        data.push(row)
      }
    }

    console.log("Parsed data:")
    data.forEach((row, index) => {
      console.log(`${index + 1}. ${row["Položka"]}:`)
      console.log(`   Dotace: ${row["Dotace"]}`)
      console.log(`   Cena pod 400k: ${row["Cena pod 400k"]}`)
      console.log(`   Doplatek pod 400k: ${row["Doplatek pod 400k"]}`)
      console.log(`   Cena nad 400k: ${row["Cena nad 400k"]}`)
      console.log(`   Doplatek nad 400k: ${row["Doplatek nad 400k"]}`)
      console.log("---")
    })

    // Create the pricing data object
    const pricingData = {}
    data.forEach((row) => {
      const itemName = row["Položka"]
      if (itemName) {
        pricingData[itemName] = {
          grant: Number.parseFloat(row["Dotace"]) || 0,
          priceUnder400k: Number.parseFloat(row["Cena pod 400k"]) || 0,
          surchargeUnder400k: Number.parseFloat(row["Doplatek pod 400k"]) || 0,
          priceOver400k: Number.parseFloat(row["Cena nad 400k"]) || 0,
          surchargeOver400k: Number.parseFloat(row["Doplatek nad 400k"]) || 0,
        }
      }
    })

    console.log("Generated pricing data:")
    console.log(JSON.stringify({ pricingData }, null, 2))

    return { data, pricingData }
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return { data: [], pricingData: {} }
  }
}

// Execute the function
analyzePricingLogic()
