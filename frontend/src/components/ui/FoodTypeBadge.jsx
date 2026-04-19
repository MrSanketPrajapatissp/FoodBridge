import { Leaf, Sprout, UtensilsCrossed } from 'lucide-react'
const configs = {
  VEG:    { bg:'bg-green-50',   text:'text-green-700',   icon:Leaf,            label:'Veg' },
  NON_VEG:{ bg:'bg-orange-50',  text:'text-orange-700',  icon:UtensilsCrossed, label:'Non-Veg' },
  VEGAN:  { bg:'bg-emerald-50', text:'text-emerald-700', icon:Sprout,          label:'Vegan' },
  MIXED:  { bg:'bg-purple-50',  text:'text-purple-700',  icon:UtensilsCrossed, label:'Mixed' },
}
export default function FoodTypeBadge({ type }) {
  const c = configs[type] || configs.MIXED
  const Icon = c.icon
  return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-badge ${c.bg} ${c.text} font-mono text-xs font-bold uppercase tracking-wide`}><Icon size={12} strokeWidth={2}/>{c.label}</span>
}
