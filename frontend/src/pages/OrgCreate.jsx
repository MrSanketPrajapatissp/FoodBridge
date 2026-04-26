import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, MapPin, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import AddressAutocomplete from '../components/ui/AddressAutocomplete'
import { api } from '../utils/api'

export default function OrgCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    organization_name: '',
    registration_number: '',
    address: '',
    city: '',
    state: '',
    location_lat: '',
    location_lng: '',
    service_radius_km: 10
  })

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setToast({ message: 'Geolocation not supported', type: 'warning' })
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({ ...formData, location_lat: pos.coords.latitude.toFixed(6), location_lng: pos.coords.longitude.toFixed(6) })
        setLoading(false)
        setToast({ message: 'Location detected!', type: 'success' })
      },
      () => {
        setLoading(false)
        setToast({ message: 'Could not detect location', type: 'error' })
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/orgs/create/', formData)
      if (res.ok) {
        setToast({ message: 'Organization profile created!', type: 'success' })
        setTimeout(() => navigate('/org/profile'), 1500)
      } else {
        const err = await res.json()
        setToast({ message: 'Failed to create profile', type: 'error' })
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
      <div className="max-w-3xl mx-auto py-12 px-6 animate-fade-up">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-card bg-primary-light flex items-center justify-center text-primary shadow-sm"><Building2 size={32} /></div>
          <div>
            <h1 className="font-heading font-bold text-3xl text-text-primary">Organization Profile</h1>
            <p className="font-body text-text-secondary">Set up your NGO verified profile to start claiming food</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card p-8 space-y-6">
            <h2 className="font-heading font-bold text-xl mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Organization Name</label>
                <input type="text" required className="input-field" placeholder="e.g. Community Kitchen" value={formData.organization_name} onChange={e => setFormData({ ...formData, organization_name: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Registration Number</label>
                <input type="text" required className="input-field" placeholder="NGO-123456" value={formData.registration_number} onChange={e => setFormData({ ...formData, registration_number: e.target.value })} />
              </div>
            </div>
            
            <div>
              <AddressAutocomplete
                label="Organization Address"
                placeholder="Search your NGO address..."
                value={formData.address}
                required
                onChange={(addr, lat, lng) => setFormData(prev => ({
                  ...prev,
                  address: addr,
                  location_lat: lat ? lat.toFixed(6) : prev.location_lat,
                  location_lng: lng ? lng.toFixed(6) : prev.location_lng,
                }))}
              />
              {formData.location_lat && (
                <p className="text-xs text-primary font-mono mt-1">
                  Coordinates auto-set: {formData.location_lat}, {formData.location_lng}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">City</label>
                <input type="text" required className="input-field" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div>
                <label className="form-label">State</label>
                <input type="text" required className="input-field" placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-xl">Location & Radius</h2>
              <Button variant="secondary" size="sm" type="button" onClick={detectLocation} loading={loading}>
                <MapPin size={16}/> Use GPS Instead
              </Button>
            </div>

            {/* Show coordinates if detected */}
            {formData.location_lat ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-button px-4 py-2">
                <MapPin size={16} className="text-primary" />
                <span className="font-mono text-sm text-primary font-bold">
                  {formData.location_lat}, {formData.location_lng}
                </span>
                <span className="text-xs text-text-muted ml-1">coordinates saved</span>
              </div>
            ) : (
              <p className="text-xs text-text-muted font-body">
                Coordinates will be set automatically when you pick an address above. Or use GPS.
              </p>
            )}

            <div>
              <label className="form-label">Service Radius (km)</label>
              <div className="flex items-center gap-4">
                <input type="range" min="1" max="50" className="flex-1 accent-primary" value={formData.service_radius_km} onChange={e => setFormData({ ...formData, service_radius_km: e.target.value })} />
                <span className="font-mono font-bold text-primary w-12 text-right">{formData.service_radius_km}km</span>
              </div>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full py-4 text-lg">Save NGO Profile</Button>
        </form>
      </div>
    </Layout>
  )
}
