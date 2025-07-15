// Fetch and analyze the new pricing CSV
async function analyzeNewPricing() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kalkulacka_ceny_9.7.25-YB1zGckH3xfUbNKXFT14vVeZU3w6Ck.csv",
    )
    const csvText = await response.text()

    console.log("CSV Content:")
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

    console.log("Parsed data:", data)
    console.log("Number of items:", data.length)

    // Analyze the structure
    data.forEach((row, index) => {
      console.log(`Item ${index + 1}:`, {
        name: row["Položka"],
        grant: row["Dotace"],
        priceUnder400k: row["Cena pod 400k"],
        surchargeUnder400k: row["Doplatek pod 400k"],
        priceOver400k: row["Cena nad 400k"],
        surchargeOver400k: row["Doplatek nad 400k"],
      })
    })

    return { data, headers }
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return { data: [], headers: [] }
  }
}

// Execute the function
analyzeNewPricing()
