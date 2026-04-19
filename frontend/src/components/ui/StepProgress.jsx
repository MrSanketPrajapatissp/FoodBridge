import { Check } from 'lucide-react'
export default function StepProgress({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((step, i) => {
        const n=i+1, done=n<currentStep, current=n===currentStep, pending=n>currentStep
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold transition-all duration-300 ${done?'bg-primary text-white':''} ${current?'border-2 border-primary text-primary bg-white':''} ${pending?'bg-surface-muted text-text-muted':''}`}>
                {done ? <Check size={18} strokeWidth={2.5}/> : n}
              </div>
              <span className={`mt-2 text-xs font-mono font-bold uppercase tracking-wide ${done||current?'text-primary':'text-text-muted'}`}>{step}</span>
            </div>
            {i<steps.length-1 && <div className={`flex-1 h-0.5 mx-3 mb-5 transition-all duration-300 ${done?'bg-primary':'bg-surface-border'}`}/>}
          </div>
        )
      })}
    </div>
  )
}
