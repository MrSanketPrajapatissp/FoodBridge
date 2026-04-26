import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Clock, ArrowRight, ShieldCheck, Navigation, Map, ChevronDown, ChevronUp, Phone, Mail, User } from 'lucide-react'
import Layout from '../components/Layout'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import RouteMap from '../components/RouteMap'
import { api } from '../utils/api'

export default function MyClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedMap, setExpandedMap] = useState(null)
  const [expandedContact, setExpandedContact] = useState(null)

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

  const toggleMap = (claimId) => {
    setExpandedMap(expandedMap === claimId ? null : claimId)
  }

  const toggleContact = (claimId) => {
    setExpandedContact(expandedContact === claimId ? null : claimId)
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
          <div className="space-y-6 animate-fade-in">
             {claims.map(c => (
               <div key={c.id} className="card p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex flex-col md:flex-row">
                   {/* OTP Section */}
                   <div className="bg-primary/5 p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-surface-border w-full md:w-48">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3"><Heart size={24}/></div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-1">Pickup Code</span>
                      <span className="text-2xl font-mono font-black text-primary tracking-tighter">{c.otp_code}</span>
                   </div>
                   
                   {/* Details Section */}
                   <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                          <div className="flex items-center justify-between gap-4 mb-3">
                              <StatusBadge status={c.status} />
                              <span className="text-xs font-mono text-text-muted">ID-{c.id.toString().padStart(4,'0')}</span>
                          </div>
                          <h3 className="font-heading font-bold text-xl mb-3 text-text-primary">{c.donation_title}</h3>
                          
                          {/* Distance Badge */}
                          {c.distance_km != null && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-badge border border-emerald-100">
                                <MapPin size={14} />
                                <span className="font-mono text-sm font-bold">{c.distance_km} km</span>
                                <span className="text-xs font-body">from your NGO</span>
                              </div>
                            </div>
                          )}

                          {/* Pickup Address */}
                          {c.donation_address && (
                            <div className="flex items-center gap-2 text-sm font-body text-text-secondary mb-3">
                              <Navigation size={14} className="text-primary flex-shrink-0" />
                              <span>{c.donation_address}</span>
                            </div>
                          )}
                          
                          {c.status === 'CLAIMED' && (
                              <div className="flex items-center gap-2 text-sm font-body text-amber-700 bg-amber-50 px-3 py-2 rounded-button border border-amber-100">
                                  <ShieldCheck size={16}/> Show the code above to the donor at pickup
                              </div>
                          )}
                      </div>
                      
                      <div className="mt-6 flex items-center justify-between border-t border-surface-border pt-4 flex-wrap gap-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Link to={`/donations/${c.donation}`} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                                View Details <ArrowRight size={14}/>
                            </Link>
                            
                            {/* Donor Contact Toggle */}
                            {c.donor_name && (
                              <button
                                onClick={() => toggleContact(c.id)}
                                className="text-sm font-bold text-violet-600 flex items-center gap-1.5 hover:text-violet-700 transition-colors bg-violet-50 px-3 py-1.5 rounded-button border border-violet-100 hover:border-violet-200"
                              >
                                <Phone size={14}/>
                                {expandedContact === c.id ? 'Hide Contact' : 'Donor Contact'}
                                {expandedContact === c.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                              </button>
                            )}

                            {/* Show Map Toggle — only for CLAIMED (active pickups) */}
                            {c.status === 'CLAIMED' && c.donation_lat && c.ngo_lat && (
                              <button
                                onClick={() => toggleMap(c.id)}
                                className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-button border border-emerald-100 hover:border-emerald-200"
                              >
                                <Map size={14}/>
                                {expandedMap === c.id ? 'Hide Route' : 'Show Route'}
                                {expandedMap === c.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-text-muted font-body">Claimed {new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                   </div>
                 </div>

                 {/* Expandable Donor Contact Card */}
                 {expandedContact === c.id && c.donor_name && (
                   <div className="border-t border-surface-border bg-violet-50/50 p-5 animate-fade-up">
                     <h4 className="font-heading font-bold text-sm text-violet-700 mb-3 flex items-center gap-2">
                       <User size={16} /> Donor Contact Information
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="flex items-center gap-3 bg-white rounded-button px-4 py-3 border border-violet-100">
                         <User size={16} className="text-violet-500 flex-shrink-0" />
                         <div>
                           <p className="text-xs text-text-muted font-body">Name</p>
                           <p className="font-heading font-bold text-sm text-text-primary">{c.donor_name}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 bg-white rounded-button px-4 py-3 border border-violet-100">
                         <Phone size={16} className="text-violet-500 flex-shrink-0" />
                         <div>
                           <p className="text-xs text-text-muted font-body">Phone</p>
                           <a href={`tel:+91${c.donor_phone}`} className="font-heading font-bold text-sm text-primary hover:underline">
                             +91 {c.donor_phone}
                           </a>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 bg-white rounded-button px-4 py-3 border border-violet-100">
                         <Mail size={16} className="text-violet-500 flex-shrink-0" />
                         <div>
                           <p className="text-xs text-text-muted font-body">Email</p>
                           <a href={`mailto:${c.donor_email}`} className="font-heading font-bold text-sm text-primary hover:underline truncate">
                             {c.donor_email}
                           </a>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Expandable Map Section */}
                 {expandedMap === c.id && c.donation_lat && c.ngo_lat && (
                   <div className="border-t border-surface-border animate-fade-up">
                     <RouteMap
                       ngoLat={c.ngo_lat}
                       ngoLng={c.ngo_lng}
                       donorLat={c.donation_lat}
                       donorLng={c.donation_lng}
                       ngoName={c.ngo_name}
                       donorAddress={c.donation_address}
                       distanceKm={c.distance_km}
                     />
                   </div>
                 )}
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
