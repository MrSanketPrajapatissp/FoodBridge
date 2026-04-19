import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UtensilsCrossed, MapPin, Camera, CheckCircle2, Upload, Trash2, Clock } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import StepProgress from '../components/ui/StepProgress'
import FoodTypeBadge from '../components/ui/FoodTypeBadge'
import Toast from '../components/ui/Toast'
import { api } from '../utils/api'

const STEPS = ['Details', 'Location', 'Photos', 'Review']

export default function Donate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [photos, setPhotos] = useState([])
  const [formData, setFormData] = useState({
    title: '', food_type: 'VEG', quantity_servings: '', description: '', allergen_notes: '',
    pickup_address: '', 
    date: '', start_time: '', end_time: ''
  })

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    setPhotos([...photos, ...files])
  }

  const removePhoto = (index) => setPhotos(photos.filter((_, i) => i !== index))

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

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-2xl">Pickup Location & Time</h2>
              <div>
                <label className="form-label">Pickup Address</label>
                <textarea required className="textarea-field h-24" placeholder="Full street address (e.g. 1600 Amphitheatre Pkwy, Mountain View, CA)..." value={formData.pickup_address} onChange={e => setFormData({ ...formData, pickup_address: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          )}

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
                  <p className="flex items-center gap-2"><Clock size={16} className="text-text-muted"/> {formData.date || new Date().toISOString().split('T')[0]} | {formData.start_time} - {formData.end_time}</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-card border border-green-200 text-green-800 text-sm flex items-center gap-3">
                <CheckCircle2 size={20} />
                <p>By posting, you confirm the food is fresh and safe for consumption.</p>
              </div>
            </div>
          )}

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
