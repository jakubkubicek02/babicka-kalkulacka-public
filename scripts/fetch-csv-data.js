// Fetch and parse the CSV data to understand the structure
async function fetchCSVData() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kalkulacka_data-tbwInKwA3owzqMWOOmAGTrlnq7oJ8n.csv",
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

    // Create mapping object for surcharges
    const surchargeMapping = {}
    data.forEach((row) => {
      if (row.name && row.surcharge) {
        surchargeMapping[row.name] = Number.parseFloat(row.surcharge) || 0
      }
    })

    console.log("Surcharge mapping:", surchargeMapping)

    return { data, surchargeMapping }
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return { data: [], surchargeMapping: {} }
  }
}

// Execute the function
fetchCSVData()
