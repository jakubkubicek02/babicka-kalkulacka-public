export interface MunicipalitiesData {
  municipalities: string[]
  count: number
  lastUpdated: string
  bonus: number
}

export async function loadMunicipalities(): Promise<MunicipalitiesData> {
  try {
    const response = await fetch("/municipalities-data.json")
    if (!response.ok) {
      throw new Error("Failed to load municipalities data")
    }
    return await response.json()
  } catch (error) {
    console.error("Error loading municipalities:", error)
    return {
      municipalities: [],
      count: 0,
      lastUpdated: new Date().toISOString(),
      bonus: 5,
    }
  }
}
