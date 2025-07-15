"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"

interface MunicipalitySearchProps {
  selectedMunicipality: string
  onMunicipalityChange: (municipality: string) => void
  municipalities: string[]
}

export function MunicipalitySearch({
  selectedMunicipality,
  onMunicipalityChange,
  municipalities,
}: MunicipalitySearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Normalize text for better matching (remove diacritics and convert to lowercase)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  }

  // Filter municipalities with exact character matching
  const filteredMunicipalities = (() => {
    const trimmedSearchTerm = searchTerm.trim()
    if (trimmedSearchTerm === "") {
      return []
    }

    const searchNormalized = normalizeText(trimmedSearchTerm)

    // Remove duplicates first, then filter
    const uniqueMunicipalities = [...new Set(municipalities)]
    
    // Only show municipalities that start with the exact search term
    const exactMatches = uniqueMunicipalities.filter((municipality) => {
      const municipalityNormalized = normalizeText(municipality)
      return municipalityNormalized.startsWith(searchNormalized)
    })

    // Sort results: exact match first, then by length, then alphabetically
    return exactMatches.sort((a, b) => {
      const aNormalized = normalizeText(a)
      const bNormalized = normalizeText(b)
      const searchNormalized = normalizeText(trimmedSearchTerm)

      // Exact match has highest priority
      if (aNormalized === searchNormalized && bNormalized !== searchNormalized) return -1
      if (bNormalized === searchNormalized && aNormalized !== searchNormalized) return 1

      // If both are exact matches or both are not, sort by length (shorter first)
      if (a.length !== b.length) {
        return a.length - b.length
      }

      // Finally, alphabetical order
      return a.localeCompare(b, "cs")
    })
  })()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMunicipalitySelect = (municipality: string) => {
    onMunicipalityChange(municipality)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClear = () => {
    onMunicipalityChange("")
    setSearchTerm("")
    setIsOpen(false)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMunicipality) {
      const newValue = e.target.value
      setSearchTerm(newValue)
      setIsOpen(newValue.trim() !== "")
    }
  }

  const showDropdown = isOpen && !selectedMunicipality && searchTerm.trim() !== ""

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedMunicipality || searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={selectedMunicipality ? selectedMunicipality : "Zadejte Vaši obec ..."}
          className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          readOnly={!!selectedMunicipality}
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {selectedMunicipality && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <Search className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredMunicipalities.length > 0 ? (
            filteredMunicipalities.map((municipality) => (
              <button
                key={municipality}
                onClick={() => handleMunicipalitySelect(municipality)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                type="button"
              >
                {municipality}
              </button>
            ))
          ) : (
            <div className="px-4 py-4 text-base font-bold text-gray-700 text-center">
              Pokud nevidíte "{searchTerm}" mezi obcemi výše, nejspíše nemáte nárok na extra bonus 5%
            </div>
          )}
        </div>
      )}
    </div>
  )
}
