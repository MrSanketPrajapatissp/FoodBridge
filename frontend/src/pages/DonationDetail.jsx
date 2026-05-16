import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Clock, UtensilsCrossed, ArrowLeft, ShieldCheck, Heart, AlertTriangle, Navigation } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import FoodTypeBadge from '../components/ui/FoodTypeBadge'
import Toast from '../components/ui/Toast'
import { api, BASE } from '../utils/api'

export default function DonationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [donation, setDonation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myOrg, setMyOrg] = useState(null)
  const [toast, setToast] = useState(null)
  const [countdown, setCountdown] = useState('')
  const [distanceError, setDistanceError] = useState(null)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    fetchDonation()
    fetchMyOrg()
  }, [id])

  useEffect(() => {
    if (!donation) return
    
    if (donation.status === 'PICKED_UP' || donation.status === 'EXPIRED') {
      setCountdown(donation.status)
      return
    }

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
    
    setClaiming(true)
    setDistanceError(null)
    
    try {
      const res = await api.post('/claims/create/', { donation_id: id })
      if (res.ok) {
        const data = await res.json()
        const distMsg = data.distance_km
          ? ` Pickup is ${data.distance_km} km from your location.`
          : ''
        setToast({ message: `Donation claimed successfully!${distMsg}`, type: 'success' })
        setTimeout(() => navigate('/my-claims'), 2000)
      } else {
        const err = await res.json()
        
        // Handle distance exceeded error with a premium banner
        if (err.type === 'distance_exceeded') {
          setDistanceError({
            distance: err.distance_km,
            radius: err.service_radius_km,
            message: err.error
          })
        } else {
          setToast({ message: err.error || 'Failed to claim', type: 'error' })
        }
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setClaiming(false)
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
                    <img src={donation.photos[0].photo.startsWith('http') ? donation.photos[0].photo : `${BASE.replace('/api', '')}${donation.photos[0].photo}`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted"><UtensilsCrossed size={64} /></div>
                )}
                <div className="absolute top-6 left-6"><FoodTypeBadge type={donation.food_type} /></div>
              </div>
              
              <div className="flex gap-4">
                {donation.photos?.slice(1).map((p, i) => (
                  <div key={i} className="w-24 h-24 rounded-card overflow-hidden border-2 border-surface-border">
                    <img src={p.photo.startsWith('http') ? p.photo : `${BASE.replace('/api', '')}${p.photo}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                    <StatusBadge status={donation.status} />
                    <span className="font-mono text-sm text-text-secondary">#{`DON-${donation.id.toString().padStart(5, '0')}`}</span>
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
                        <h4 className="font-heading font-bold text-lg">Status</h4>
                        {donation.status === 'PICKED_UP' ? (
                          <div className="mt-2 bg-gray-100 text-gray-500 font-bold px-4 py-2 rounded-md inline-block shadow-inner">
                            COMPLETED / EXPIRED
                          </div>
                        ) : (
                          <p className={`font-mono text-3xl font-extrabold mt-1 tracking-tight ${countdown === 'EXPIRED' ? 'text-red-500' : 'text-primary'}`}>{countdown}</p>
                        )}
                    </div>
                </div>
              </div>

              {/* Distance Error Banner */}
              {distanceError && (
                <div className="animate-fade-up rounded-card border-2 border-red-200 bg-gradient-to-r from-red-50 via-white to-orange-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-heading font-bold text-red-800 mb-1">Too Far to Claim</h4>
                      <p className="font-body text-sm text-red-700 leading-relaxed mb-3">
                        {distanceError.message}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-badge border border-red-100 shadow-sm">
                          <Navigation size={14} className="text-red-400" />
                          <span className="font-mono text-sm font-bold text-red-700">{distanceError.distance} km</span>
                          <span className="text-xs text-red-400">distance</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-badge border border-emerald-100 shadow-sm">
                          <MapPin size={14} className="text-primary" />
                          <span className="font-mono text-sm font-bold text-primary">{distanceError.radius} km</span>
                          <span className="text-xs text-text-muted">your radius</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-surface-border space-y-4">
                 {donation.status === 'AVAILABLE' ? (
                   <>
                     <Button onClick={handleClaim} disabled={claiming} className="w-full h-16 text-lg">
                       {claiming ? (
                         <span className="flex items-center gap-2">
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Claiming...
                         </span>
                       ) : (
                         <><Heart size={20} /> Claim for My NGO</>
                       )}
                     </Button>
                     {(!myOrg || myOrg.verification_status !== 'VERIFIED') && (
                        <p className="text-xs text-center font-body text-text-muted italic flex items-center justify-center gap-1">
                            <ShieldCheck size={14}/> Verified NGO status required to claim
                        </p>
                     )}
                   </>
                 ) : (
                   <div className="w-full h-16 flex items-center justify-center bg-surface-muted text-text-secondary rounded-button font-heading font-bold border border-surface-border opacity-70">
                     No Longer Available
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </Layout>
  )
}
