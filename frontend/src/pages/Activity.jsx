import { useState, useEffect } from 'react'
import { Bell, UtensilsCrossed, ShieldCheck, CheckCircle2, Leaf } from 'lucide-react'
import Layout from '../components/Layout'
import { api } from '../utils/api'

function timeAgo(dt) {
  const s = Math.floor((new Date() - new Date(dt)) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

const TYPE_META = {
  created: { icon: UtensilsCrossed, color: 'text-blue-500 bg-blue-50', label: 'Posted' },
  claimed:  { icon: ShieldCheck,   color: 'text-amber-500 bg-amber-50', label: 'Claimed' },
  verified: { icon: CheckCircle2,  color: 'text-green-500 bg-green-50', label: 'Verified' },
  picked_up:{ icon: Leaf,          color: 'text-primary bg-primary/10', label: 'Picked Up' },
}

export default function Activity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const role = localStorage.getItem('user_role')

  useEffect(() => { fetchActivity() }, [])

  const fetchActivity = async () => {
    try {
      const endpoint = role === 'NGO' ? '/claims/my/' : '/donations/my/'
      const res = await api.get(endpoint)
      if (res.ok) {
        const data = await res.json()
        // Build activity feed from claims or donations
        const items = role === 'NGO'
          ? data.map(c => ({
              id: c.id,
              type: c.status === 'PICKED_UP' ? 'picked_up' : 'claimed',
              title: c.status === 'PICKED_UP' ? `Pickup complete: ${c.donation_title}` : `Claimed: ${c.donation_title}`,
              time: c.updated_at || c.created_at,
            }))
          : data.flatMap(d => {
              const ev = [{ id: `c${d.id}`, type: 'created', title: `You posted "${d.title}"`, time: d.created_at }]
              if (d.status === 'CLAIMED') ev.push({ id: `cl${d.id}`, type: 'claimed', title: `"${d.title}" was claimed by an NGO`, time: d.created_at })
              if (d.status === 'PICKED_UP') ev.push({ id: `pu${d.id}`, type: 'picked_up', title: `"${d.title}" was picked up — thank you!`, time: d.created_at })
              return ev
            })
        setActivities(items.sort((a, b) => new Date(b.time) - new Date(a.time)))
      }
    } catch { console.error('fetch failed') }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="section-container py-12 max-w-2xl mx-auto">
        <header className="mb-10 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Bell size={20}/></div>
            <h1 className="font-heading font-bold text-3xl text-text-primary">Activity</h1>
          </div>
          <p className="font-body text-text-secondary">Your recent actions and donation updates</p>
        </header>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-surface-muted rounded-card animate-pulse"/>)}</div>
        ) : activities.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            {activities.map(({ id, type, title, time }) => {
              const { icon: Icon, color, label } = TYPE_META[type] || TYPE_META.created
              return (
                <div key={id} className="card p-5 flex items-center gap-5 hover:shadow-sm transition-shadow">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={20}/></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-text-primary text-sm leading-tight">{title}</p>
                    <p className="font-mono text-xs text-text-muted mt-1">{timeAgo(time)}</p>
                  </div>
                  <span className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-full flex-shrink-0 ${color}`}>{label}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bell size={48} className="mx-auto text-text-muted mb-4"/>
            <h3 className="font-heading font-bold text-xl mb-2">No Activity Yet</h3>
            <p className="font-body text-text-secondary text-sm">Your actions will appear here as you use FoodBridge.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
