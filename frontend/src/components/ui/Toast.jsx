import { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
const types = {
  success:{ icon:CheckCircle2, cls:'bg-green-50 border-green-200 text-green-800' },
  error:  { icon:XCircle,      cls:'bg-red-50 border-red-200 text-red-800' },
  warning:{ icon:AlertCircle,  cls:'bg-yellow-50 border-yellow-200 text-yellow-800' },
}
export default function Toast({ message, type='success', onClose, duration=4000 }) {
  useEffect(() => { const t = setTimeout(onClose, duration); return () => clearTimeout(t) }, [onClose, duration])
  const { icon:Icon, cls } = types[type] || types.success
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-card border shadow-card-hover animate-fade-up max-w-sm ${cls}`}>
      <Icon size={20} strokeWidth={2} className="flex-shrink-0"/>
      <p className="font-body text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} aria-label="Dismiss" className="flex-shrink-0 hover:opacity-70"><X size={16} strokeWidth={2}/></button>
    </div>
  )
}
