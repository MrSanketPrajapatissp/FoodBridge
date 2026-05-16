import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, UtensilsCrossed, Trash2, Edit } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import Toast from '../components/ui/Toast'
import { api, BASE } from '../utils/api'
import { timeAgo } from '../utils/timeAgo'

export default function MyDonations() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchMyDonations()
  }, [])

  const fetchMyDonations = async () => {
    try {
      const res = await api.get('/donations/my/')
      if (res.ok) setDonations(await res.json())
    } catch {
      console.error('Fetch failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this donation?')) return
    try {
      const res = await api.post(`/donations/${id}/cancel/`)
      if (res.ok) {
        setDonations(donations.map(d => d.id === id ? { ...d, status: 'CANCELLED' } : d))
        setToast({ message: 'Donation cancelled', type: 'success' })
      }
    } catch {
      setToast({ message: 'Cancel failed', type: 'error' })
    }
  }

  const [otpInputs, setOtpInputs] = useState({})

  const handleVerifyOTP = async (donationId, claimId) => {
    const otp = otpInputs[donationId]
    if (!otp) return
    try {
      const res = await api.post(`/claims/${claimId}/verify-otp/`, { otp })
      if (res.ok) {
        setDonations(donations.map(d => d.id === donationId ? { ...d, status: 'PICKED_UP' } : d))
        setToast({ message: 'Pickup verified!', type: 'success' })
      } else {
        const err = await res.json()
        setToast({ message: err.error || 'Invalid OTP', type: 'error' })
      }
    } catch {
      setToast({ message: 'Verification failed', type: 'error' })
    }
  }

  return (
    <Layout>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="section-container py-12">
        <div className="flex items-center justify-between gap-6 mb-12 animate-fade-up">
          <div>
            <h1 className="font-heading font-bold text-3xl text-text-primary">My Donations</h1>
            <p className="font-body text-text-secondary mt-1">Manage and track your food contributions</p>
          </div>
          <Link to="/donate" className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Post New
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-muted rounded-card animate-pulse"></div>)}
          </div>
        ) : donations.length > 0 ? (
          <div className="space-y-4 animate-fade-in">
             {donations.map(d => (
               <div key={d.id} className="card p-6 flex flex-col md:flex-row items-center gap-6">
                 <div className="w-full md:w-24 h-24 rounded-card bg-surface-muted overflow-hidden flex-shrink-0">
                    {d.photos && d.photos.length > 0 && (
                        <img src={d.photos[0].photo.startsWith('http') ? d.photos[0].photo : `${BASE.replace('/api', '')}${d.photos[0].photo}`} className="w-full h-full object-cover" />
                    )}
                 </div>
                 <div className="flex-1 text-center md:text-left">
                    <h3 className="font-heading font-bold text-xl mb-1">{d.title}</h3>
                    <p className="font-body text-sm text-text-secondary">{timeAgo(d.created_at)} • {d.quantity_servings} servings</p>
                    
                    {d.status === 'CLAIMED' && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                            <input 
                                type="text" 
                                placeholder="Enter 6-digit OTP" 
                                maxLength={6}
                                className="input-field max-w-[150px] !h-10 text-center font-mono font-bold tracking-widest"
                                value={otpInputs[d.id] || ''}
                                onChange={e => setOtpInputs({ ...otpInputs, [d.id]: e.target.value })}
                            />
                            <Button size="sm" onClick={() => handleVerifyOTP(d.id, d.claim_id)}>Verify & Complete</Button>
                        </div>
                    )}
                 </div>
                 <div className="flex items-center gap-4">
                    <StatusBadge status={d.status} />
                    {d.status === 'AVAILABLE' && (
                        <button onClick={() => handleCancel(d.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors" title="Cancel Donation"><Trash2 size={20}/></button>
                    )}
                    <Link to={`/donations/${d.id}`} className="text-primary font-bold hover:underline">View</Link>
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <EmptyState icon={UtensilsCrossed} title="No Donations Yet" message="You haven't posted any food donations. Start helping your community today!" action={<Link to="/donate" className="btn-primary">Post Your First Donation</Link>} />
        )}
      </div>
    </Layout>
  )
}
