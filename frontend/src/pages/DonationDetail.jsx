import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Clock, UtensilsCrossed, ArrowLeft, ShieldCheck, Heart } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import FoodTypeBadge from '../components/ui/FoodTypeBadge'
import Toast from '../components/ui/Toast'
import { api } from '../utils/api'

export default function DonationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [donation, setDonation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myOrg, setMyOrg] = useState(null)
  const [toast, setToast] = useState(null)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    fetchDonation()
    fetchMyOrg()
  }, [id])

  useEffect(() => {
    if (!donation) return
    const timer = setInterval(() => {
      const diff = new Date(donation.expires_at) - new Date()
      if (diff <= 0) { setCountdown('EXPIRED'); clearInterval(timer) }
      else {
        const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000)
        setCountdown(`${h}h ${m}m ${s}s`)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [donation])

  const fetchDonation = async () => {
    try {
      const res = await api.get(`/donations/${id}/`)
      if (res.ok) setDonation(await res.json())
    } catch { navigate('/donations') }
    finally { setLoading(false) }
  }

  const fetchMyOrg = async () => {
    const role = localStorage.getItem('user_role')
    if (role === 'NGO') {
        const res = await api.get('/orgs/my/')
        if (res.ok) setMyOrg(await res.json())
    }
  }

  const handleClaim = async () => {
    if (!myOrg || myOrg.verification_status !== 'VERIFIED') {
        setToast({ message: 'Only verified NGOs can claim donations.', type: 'warning' })
        return
    }
    
    try {
      const res = await api.post('/claims/create/', { donation_id: id })
      if (res.ok) {
        setToast({ message: 'Donation claimed successfully!', type: 'success' })
        setTimeout(() => navigate('/my-claims'), 1500)
      } else {
        const err = await res.json()
        setToast({ message: err.error || 'Failed to claim', type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    }
  }

  if (loading) return <Layout><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></Layout>

  return (
    <Layout>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="section-container py-12">
        <Link to="/donations" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 font-body font-medium">
          <ArrowLeft size={18} /> Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-up">
           <div className="space-y-6">
              <div className="card aspect-video relative bg-surface-muted overflow-hidden">
                {donation.photos && donation.photos.length > 0 ? (
                    <img src={donation.photos[0].photo.startsWith('http') ? donation.photos[0].photo : `http://localhost:8000${donation.photos[0].photo}`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted"><UtensilsCrossed size={64} /></div>
                )}
                <div className="absolute top-6 left-6"><FoodTypeBadge type={donation.food_type} /></div>
              </div>
              
              <div className="flex gap-4">
                {donation.photos?.slice(1).map((p, i) => (
                  <div key={i} className="w-24 h-24 rounded-card overflow-hidden border-2 border-surface-border">
                    <img src={p.photo.startsWith('http') ? p.photo : `http://localhost:8000${p.photo}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                    <StatusBadge status={donation.status} />
                    <span className="font-mono text-sm text-text-secondary">#DON-{donation.id.toString().padStart(5, '0')}</span>
                </div>
                <h1 className="font-heading font-bold text-4xl text-text-primary mb-2">{donation.title}</h1>
                <p className="font-body text-lg text-text-secondary">{donation.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6 bg-surface-muted rounded-card border border-surface-border">
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Quantity</p>
                    <p className="font-heading font-bold text-xl text-primary">{donation.quantity_servings} Servings</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Donor</p>
                    <p className="font-heading font-bold text-xl text-text-primary">{donation.donor_name}</p>
                  </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary flex-shrink-0"><MapPin size={20} /></div>
                    <div>
                        <h4 className="font-heading font-bold text-lg">Pickup Location</h4>
                        <p className="font-body text-text-secondary leading-relaxed">{donation.pickup_address}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary flex-shrink-0"><Clock size={20} /></div>
                    <div>
                        <h4 className="font-heading font-bold text-lg">Expires In</h4>
                        <p className="font-mono text-3xl font-extrabold text-primary mt-1 tracking-tight">{countdown}</p>
                    </div>
                </div>
              </div>

              <div className="pt-6 border-t border-surface-border space-y-4">
                 <Button onClick={handleClaim} className="w-full h-16 text-lg"><Heart size={20} /> Claim for My NGO</Button>
                 {(!myOrg || myOrg.verification_status !== 'VERIFIED') && (
                    <p className="text-xs text-center font-body text-text-muted italic flex items-center justify-center gap-1">
                        <ShieldCheck size={14}/> Verified NGO status required to claim
                    </p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </Layout>
  )
}
