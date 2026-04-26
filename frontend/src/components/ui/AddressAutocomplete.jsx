/**
 * AddressAutocomplete
 * 
 * A reusable address search field that:
 * - Shows suggestions from OpenStreetMap Nominatim as you type
 * - Lets user select a suggestion (auto-fills address + sets lat/lng)
 * - Has an "Enter manually" fallback for unrecognized addresses
 * 
 * Props:
 *   label        - Field label text
 *   placeholder  - Input placeholder
 *   value        - Current address string
 *   onChange     - Called with (address, lat, lng) when user picks or types
 *   required     - HTML required attribute
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Search, PenLine, ChevronDown } from 'lucide-react'

export default function AddressAutocomplete({ label, placeholder, value, onChange, required }) {
  const [query, setQuery]           = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]       = useState(false)
  const [showDrop, setShowDrop]     = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef  = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // Fetch suggestions from Nominatim with debounce
  const fetchSuggestions = useCallback((text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!text || text.length < 3) {
      setSuggestions([])
      setShowDrop(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=6&addressdetails=1&countrycodes=in`
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en' }
        })
        const data = await res.json()
        setSuggestions(data)
        setShowDrop(data.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 400) // 400ms debounce — respects Nominatim rate limits
  }, [])

  const handleInput = (e) => {
    const text = e.target.value
    setQuery(text)
    onChange(text, null, null) // update parent with raw text, no coords yet
    fetchSuggestions(text)
  }

  const handleSelect = (suggestion) => {
    const addr = suggestion.display_name
    const lat  = parseFloat(suggestion.lat)
    const lng  = parseFloat(suggestion.lon)
    setQuery(addr)
    setSuggestions([])
    setShowDrop(false)
    onChange(addr, lat, lng) // pass address + coords to parent
  }

  const handleManualMode = () => {
    setManualMode(true)
    setShowDrop(false)
    setSuggestions([])
  }

  // Format suggestion label — show short name + city
  const formatLabel = (s) => {
    const parts = s.display_name.split(',')
    // Show first 3 parts (locality, district, state)
    return parts.slice(0, 3).join(', ').trim()
  }

  const formatSubLabel = (s) => {
    const parts = s.display_name.split(',')
    return parts.slice(3).join(', ').trim()
  }

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="form-label">{label}{required && ' *'}</label>}

      {/* Input field */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </span>
        <input
          type="text"
          required={required}
          placeholder={placeholder || 'Search address...'}
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          className="input-field pl-11 pr-4"
          autoComplete="off"
        />
      </div>

      {/* Suggestions dropdown */}
      {showDrop && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-surface-border rounded-card shadow-card-hover overflow-hidden">
          <ul className="max-h-64 overflow-y-auto divide-y divide-surface-border">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex items-start gap-3 group"
                >
                  <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-text-primary truncate">{formatLabel(s)}</p>
                    <p className="font-body text-xs text-text-muted truncate">{formatSubLabel(s)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* "Others — enter manually" option */}
          <button
            type="button"
            onClick={handleManualMode}
            className="w-full text-left px-4 py-3 bg-surface-muted hover:bg-primary/5 transition-colors flex items-center gap-3 border-t border-surface-border"
          >
            <PenLine size={16} className="text-text-muted flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium text-text-secondary">Others — Enter address manually</p>
              <p className="font-body text-xs text-text-muted">Can't find your address? Type it directly</p>
            </div>
          </button>
        </div>
      )}

      {/* Manual entry textarea (shown when user clicks "Others") */}
      {manualMode && (
        <div className="mt-2 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <PenLine size={14} className="text-primary" />
            <span className="text-xs font-body font-medium text-primary">Manual address entry</span>
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className="ml-auto text-xs text-text-muted hover:text-text-primary underline"
            >
              Back to search
            </button>
          </div>
          <textarea
            required={required}
            rows={2}
            placeholder="Type your full address here... (e.g. Sainagar Square, Near Water Tank, Amravati, Maharashtra 444605)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onChange(e.target.value, null, null)
            }}
            className="textarea-field h-20 text-sm"
          />
          <p className="text-xs text-text-muted mt-1 font-body">
            Note: Manual addresses without coordinates may affect distance calculations.
          </p>
        </div>
      )}
    </div>
  )
}
