import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, UtensilsCrossed, Filter, Search } from 'lucide-react'
import Layout from '../components/Layout'
import SkeletonCard from '../components/ui/SkeletonCard'
import EmptyState from '../components/ui/EmptyState'
import FoodTypeBadge from '../components/ui/FoodTypeBadge'
import { api } from '../utils/api'

export default function DonationList() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  useEffect(() => {
    fetchDonations()
  }, [filter, coords])

  const fetchDonations = async () => {
    setLoading(true)
    let url = `/donations/?food_type=${filter}`
    if (coords) url += `&lat=${coords.lat}&lng=${coords.lng}`
    
    try {
      const res = await api.get(url)
      if (res.ok) {
        setDonations(await res.json())
      }
    } catch {
      console.error('Fetch failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="section-container py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-up">
          <div>
            <h1 className="font-heading font-bold text-3xl text-text-primary">Available Food</h1>
            <p className="font-body text-text-secondary mt-1">Discover fresh donations near you</p>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-surface-muted p-1 px-1 rounded-badge">
            {['ALL', 'VEG', 'NON_VEG', 'VEGAN', 'MIXED'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-badge font-mono text-xs font-bold uppercase tracking-wide transition-all ${filter === f ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : donations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {donations.map(d => (
              <Link key={d.id} to={`/donations/${d.id}`} className="card group">
                <div className="aspect-video overflow-hidden relative bg-surface-muted">
                    {d.photos && d.photos.length > 0 ? (
                        <img src={d.photos[0].photo.startsWith('http') ? d.photos[0].photo : `http://localhost:8000${d.photos[0].photo}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted"><UtensilsCrossed size={40} /></div>
                    )}
                    <div className="absolute top-4 left-4"><FoodTypeBadge type={d.food_type} /></div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-bold text-xl mb-2 line-clamp-1">{d.title}</h3>
                  <div className="flex items-center justify-between text-sm font-body text-text-secondary">
                    <div className="flex items-center gap-1.5"><MapPin size={16} className="text-primary"/> {d.distance_km ? `${d.distance_km} km` : 'Near you'}</div>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold border-l border-surface-border pl-3"><Clock size={16} className="text-primary"/> {new Date(d.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={UtensilsCrossed} title="No Food Found" message={`We couldn't find any ${filter !== 'ALL' ? filter.toLowerCase().replace('_', '-') : ''} donations in your area.`} action={<Link to="/donate" className="btn-primary">Post a Donation</Link>} />
        )}
      </div>
    </Layout>
  )
}
