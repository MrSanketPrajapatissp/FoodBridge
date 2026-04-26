import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UtensilsCrossed, MapPin, Camera, CheckCircle2, Upload, Trash2, Clock, Navigation, PenLine } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import StepProgress from '../components/ui/StepProgress'
import FoodTypeBadge from '../components/ui/FoodTypeBadge'
import Toast from '../components/ui/Toast'
import AddressAutocomplete from '../components/ui/AddressAutocomplete'
import { api } from '../utils/api'

const STEPS = ['Details', 'Location', 'Photos', 'Review']

export default function Donate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [photos, setPhotos] = useState([])
  const [detectingGps, setDetectingGps] = useState(false)
  const [locationMethod, setLocationMethod] = useState(null) // 'gps' | 'address' | null

  const [formData, setFormData] = useState({
    title: '', food_type: 'VEG', quantity_servings: '', description: '', allergen_notes: '',
    pickup_address: '',
    pickup_lat: '', pickup_lng: '',
    date: '', start_time: '', end_time: ''
  })

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    setPhotos([...photos, ...files])
  }

  const removePhoto = (index) => setPhotos(photos.filter((_, i) => i !== index))

  // ---- GPS auto-detect (first option for donor) ----
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setToast({ message: 'Geolocation not supported by your browser', type: 'warning' })
      return
    }
    setDetectingGps(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        // Reverse geocode to get readable address from coordinates
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
          const data = await res.json()
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

          setFormData(prev => ({
            ...prev,
            pickup_lat: lat.toFixed(6),
            pickup_lng: lng.toFixed(6),
            pickup_address: address,
          }))
          setLocationMethod('gps')
          setToast({ message: 'Location detected! Pickup point set.', type: 'success' })
        } catch {
          // Fallback: set coords without address
          setFormData(prev => ({
            ...prev,
            pickup_lat: lat.toFixed(6),
            pickup_lng: lng.toFixed(6),
            pickup_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          }))
          setLocationMethod('gps')
        }
        setDetectingGps(false)
      },
      (err) => {
        setDetectingGps(false)
        setToast({ message: 'Could not detect location. Please enter address manually.', type: 'warning' })
        setLocationMethod('address')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    const data = new FormData()
    
    // Combine date/time with fallback
    const today = new Date().toISOString().split('T')[0]
    const d = formData.date || today
    const window_start = `${d}T${formData.start_time}:00`
    const window_end = `${d}T${formData.end_time}:00`
    
    const payload = { ...formData, pickup_window_start: window_start, pickup_window_end: window_end }
    delete payload.date
    delete payload.start_time
    delete payload.end_time

    // Map frontend pickup_lat/lng to backend field names
    if (payload.pickup_lat) payload.location_lat = payload.pickup_lat
    if (payload.pickup_lng) payload.location_lng = payload.pickup_lng
    delete payload.pickup_lat
    delete payload.pickup_lng

    Object.keys(payload).forEach(key => data.append(key, payload[key]))
    photos.forEach(file => data.append('photos', file))

    try {
      const res = await api.post('/donations/create/', data, true)
      if (res.ok) {
        setToast({ message: 'Donation posted successfully!', type: 'success' })
        setTimeout(() => navigate('/my-donations'), 1500)
      } else {
         const err = await res.json()
         const msg = typeof err === 'object' ? Object.entries(err).map(([k, v]) => `${k}: ${v}`).join(', ') : 'Failed to post donation'
         setToast({ message: msg, type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-3xl mx-auto py-12 px-6">
        <StepProgress steps={STEPS} currentStep={step} />

        <div className="mt-10 animate-fade-up">
          {/* ==================== STEP 1: Details ==================== */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-2xl">Donation Details</h2>
              <div>
                <label className="form-label">Food Title</label>
                <input type="text" className="input-field" placeholder="e.g. Freshly cooked Pasta" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Food Type</label>
                <div className="flex flex-wrap gap-3">
                  {['VEG', 'NON_VEG', 'VEGAN', 'MIXED'].map(type => (
                    <button key={type} onClick={() => setFormData({ ...formData, food_type: type })} className={`px-5 py-2.5 rounded-badge border-2 transition-all flex items-center gap-2 ${formData.food_type === type ? 'border-primary bg-primary-light text-primary' : 'border-surface-border text-text-secondary hover:border-primary/50'}`}>
                      <FoodTypeBadge type={type} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Quantity (Servings)</label>
                  <input type="number" className="input-field" placeholder="10" value={formData.quantity_servings} onChange={e => setFormData({ ...formData, quantity_servings: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <input type="text" className="input-field" placeholder="Brief details..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
              <div>
                 <label className="form-label">Allergen Notes</label>
                 <input type="text" className="input-field" placeholder="Nuts, Dairy, etc." value={formData.allergen_notes} onChange={e => setFormData({ ...formData, allergen_notes: e.target.value })} />
              </div>
            </div>
          )}

          {/* ==================== STEP 2: Location & Time ==================== */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-2xl">Pickup Location & Time</h2>

              {/* Location method selector — GPS first, Address second */}
              {!locationMethod && (
                <div className="space-y-4">
                  <p className="font-body text-text-secondary text-sm">
                    Choose how to set your pickup location:
                  </p>

                  {/* OPTION 1: Auto-detect GPS (PRIMARY) */}
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={detectingGps}
                    className="w-full card p-6 text-left hover:shadow-md transition-all border-2 border-primary/30 hover:border-primary bg-gradient-to-r from-primary/5 to-emerald-50 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        {detectingGps ? (
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Navigation size={22} className="text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-text-primary mb-1">
                          {detectingGps ? 'Detecting your location...' : 'Use My Current Location'}
                        </h3>
                        <p className="font-body text-sm text-text-secondary leading-relaxed">
                          Recommended — Automatically detect your GPS location for accurate pickup point.
                          The NGO will get exact directions to reach you.
                        </p>
                        <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-badge">
                          <CheckCircle2 size={12} /> Most Accurate
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* OPTION 2: Search address */}
                  <button
                    type="button"
                    onClick={() => setLocationMethod('address')}
                    className="w-full card p-6 text-left hover:shadow-md transition-all border-2 border-surface-border hover:border-primary/50 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                        <PenLine size={22} className="text-text-muted group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-text-primary mb-1">Enter Address Manually</h3>
                        <p className="font-body text-sm text-text-secondary leading-relaxed">
                          Search and pick your address from suggestions, or type it manually.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* GPS detected — show confirmation */}
              {locationMethod === 'gps' && formData.pickup_lat && (
                <div className="space-y-4 animate-fade-up">
                  <div className="card p-5 border-2 border-primary/20 bg-gradient-to-r from-emerald-50 to-white">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-heading font-bold text-primary">Location Detected</h4>
                        <p className="font-body text-sm text-text-secondary mt-1 leading-relaxed">
                          {formData.pickup_address}
                        </p>
                        <p className="font-mono text-xs text-primary mt-1">
                          {formData.pickup_lat}, {formData.pickup_lng}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setLocationMethod(null); setFormData(prev => ({ ...prev, pickup_lat: '', pickup_lng: '', pickup_address: '' })) }}
                      className="text-xs text-text-muted hover:text-primary underline font-body"
                    >
                      Change location method
                    </button>
                  </div>
                </div>
              )}

              {/* Address entry mode — search with autocomplete */}
              {locationMethod === 'address' && (
                <div className="space-y-4 animate-fade-up">
                  <div className="flex items-center justify-between">
                    <label className="form-label mb-0">Search Pickup Address</label>
                    <button
                      type="button"
                      onClick={() => setLocationMethod(null)}
                      className="text-xs text-text-muted hover:text-primary underline font-body"
                    >
                      Back to options
                    </button>
                  </div>
                  <AddressAutocomplete
                    placeholder="Search pickup location (e.g. Rajapeth, Amravati)..."
                    value={formData.pickup_address}
                    required
                    onChange={(addr, lat, lng) => setFormData(prev => ({
                      ...prev,
                      pickup_address: addr,
                      pickup_lat: lat ? lat.toFixed(6) : prev.pickup_lat,
                      pickup_lng: lng ? lng.toFixed(6) : prev.pickup_lng,
                    }))}
                  />
                  {formData.pickup_lat && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-button px-3 py-2">
                      <MapPin size={14} className="text-primary" />
                      <span className="font-mono text-xs text-primary font-bold">{formData.pickup_lat}, {formData.pickup_lng}</span>
                      <span className="text-xs text-text-muted">pinpoint set</span>
                    </div>
                  )}
                </div>
              )}

              {/* Time fields — always visible when location is set */}
              {locationMethod && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-surface-border">
                  <div>
                    <label className="form-label">Available Date</label>
                    <input type="date" required className="input-field" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">From</label>
                    <input type="time" required className="input-field" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Until</label>
                    <input type="time" required className="input-field" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP 3: Photos ==================== */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-2xl">Photos</h2>
              <div className="grid grid-cols-3 gap-4">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-card overflow-hidden group">
                    <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-surface-border rounded-card flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary-light transition-all">
                  <Upload className="text-text-muted mb-2" size={32} />
                  <span className="text-sm font-medium text-text-secondary">Upload Photo</span>
                  <input type="file" multiple className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                </label>
              </div>
            </div>
          )}

          {/* ==================== STEP 4: Review ==================== */}
          {step === 4 && (
            <div className="space-y-8">
              <h2 className="font-heading font-bold text-2xl">Review Donation</h2>
              <div className="card p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading font-bold text-xl">{formData.title}</h3>
                    <div className="mt-1"><FoodTypeBadge type={formData.food_type} /></div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-primary font-bold">{formData.quantity_servings} Servings</p>
                  </div>
                </div>
                <p className="font-body text-text-secondary">{formData.description}</p>
                <div className="border-t border-surface-border pt-4 text-sm space-y-2">
                  <p className="flex items-center gap-2"><MapPin size={16} className="text-text-muted"/> {formData.pickup_address}</p>
                  {formData.pickup_lat && (
                    <p className="flex items-center gap-2"><Navigation size={16} className="text-primary"/> <span className="font-mono text-xs text-primary">{formData.pickup_lat}, {formData.pickup_lng}</span></p>
                  )}
                  <p className="flex items-center gap-2"><Clock size={16} className="text-text-muted"/> {formData.date || new Date().toISOString().split('T')[0]} | {formData.start_time} - {formData.end_time}</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-card border border-green-200 text-green-800 text-sm flex items-center gap-3">
                <CheckCircle2 size={20} />
                <p>By posting, you confirm the food is fresh and safe for consumption.</p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-12">
            {step > 1 && <Button variant="secondary" onClick={handleBack} className="flex-1">Back</Button>}
            {step < 4 ? (
              <Button onClick={handleNext} className="flex-1">Continue</Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} className="flex-1">Post Donation</Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
