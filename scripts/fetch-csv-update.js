// Fetch and parse the CSV data to understand the structure
async function fetchCSVUpdate() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cen_update-GFX6osWIOP0qosKu3pGEYqWbEOnnxS.csv",
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

    // Group by categories
    const categories = {}
    data.forEach((row) => {
      const category = row.kategorie || row.category || "Unknown"
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(row)
    })

    console.log("Categories found:", Object.keys(categories))
    Object.keys(categories).forEach((cat) => {
      console.log(`${cat}: ${categories[cat].length} items`)
    })

    return { data, categories }
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return { data: [], categories: {} }
  }
}

// Execute the function
fetchCSVUpdate()
