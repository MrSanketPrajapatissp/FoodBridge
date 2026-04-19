import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react'
import Layout from '../components/Layout'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import { api } from '../utils/api'

export default function MyClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyClaims()
  }, [])

  const fetchMyClaims = async () => {
    try {
      const res = await api.get('/claims/my/')
      if (res.ok) setClaims(await res.json())
    } catch {
      console.error('Fetch failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="section-container py-12">
        <header className="mb-12 animate-fade-up text-center md:text-left">
          <h1 className="font-heading font-bold text-3xl text-text-primary">My Food Claims</h1>
          <p className="font-body text-text-secondary mt-1">Status of your food requests and pickup codes</p>
        </header>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => <div key={i} className="h-40 bg-surface-muted rounded-card animate-pulse"></div>)}
          </div>
        ) : claims.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
             {claims.map(c => (
               <div key={c.id} className="card p-0 overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
                 <div className="bg-primary/5 p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-surface-border w-full md:w-48">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3"><Heart size={24}/></div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-1">Pickup Code</span>
                    <span className="text-2xl font-mono font-black text-primary tracking-tighter">{c.otp_code}</span>
                 </div>
                 
                 <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <StatusBadge status={c.status} />
                            <span className="text-xs font-mono text-text-muted">ID-{c.id.toString().padStart(4,'0')}</span>
                        </div>
                        <h3 className="font-heading font-bold text-xl mb-3 text-text-primary">{c.donation_title}</h3>
                        
                        {c.status === 'CLAIMED' && (
                            <div className="flex items-center gap-2 text-sm font-body text-amber-700 bg-amber-50 px-3 py-2 rounded-button border border-amber-100">
                                <ShieldCheck size={16}/> Show the code above to the donor at pickup
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between border-t border-surface-border pt-4">
                        <Link to={`/donations/${c.donation}`} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                            View Details <ArrowRight size={14}/>
                        </Link>
                        <span className="text-xs text-text-muted font-body">Claimed {new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <EmptyState icon={Heart} title="No Claims Yet" message="You haven't claimed any food donations. Browse the listings to find food for your NGO." action={<Link to="/donations" className="btn-primary">Browse Food</Link>} />
        )}
      </div>
    </Layout>
  )
}
