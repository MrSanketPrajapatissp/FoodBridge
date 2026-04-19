import { CheckCircle2, Clock, AlertCircle, XCircle, ShieldCheck, Shield, ShieldX } from 'lucide-react'
const configs = {
  AVAILABLE:{ bg:'bg-green-50',      text:'text-green-700',     icon:CheckCircle2, label:'Available' },
  CLAIMED:  { bg:'bg-yellow-50',     text:'text-yellow-700',    icon:Clock,        label:'Claimed' },
  PICKED_UP:{ bg:'bg-primary-light', text:'text-primary-dark',  icon:CheckCircle2, label:'Picked Up' },
  EXPIRED:  { bg:'bg-red-50',        text:'text-red-700',       icon:XCircle,      label:'Expired' },
  CANCELLED:{ bg:'bg-red-50',        text:'text-red-700',       icon:XCircle,      label:'Cancelled' },
  HOLD:     { bg:'bg-yellow-50',     text:'text-yellow-700',    icon:Clock,        label:'On Hold' },
  CONFIRMED:{ bg:'bg-blue-50',       text:'text-blue-700',      icon:CheckCircle2, label:'Confirmed' },
  NO_SHOW:  { bg:'bg-red-50',        text:'text-red-700',       icon:AlertCircle,  label:'No Show' },
  PENDING:  { bg:'bg-yellow-50',     text:'text-yellow-700',    icon:Shield,       label:'Pending' },
  VERIFIED: { bg:'bg-green-50',      text:'text-green-700',     icon:ShieldCheck,  label:'Verified' },
  REJECTED: { bg:'bg-red-50',        text:'text-red-700',       icon:ShieldX,      label:'Rejected' },
}
export default function StatusBadge({ status }) {
  const c = configs[status] || { bg:'bg-surface-muted', text:'text-text-secondary', icon:AlertCircle, label:status }
  const Icon = c.icon
  return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-badge ${c.bg} ${c.text} font-mono text-xs font-bold uppercase tracking-wide`}><Icon size={12} strokeWidth={2}/>{c.label}</span>
}
