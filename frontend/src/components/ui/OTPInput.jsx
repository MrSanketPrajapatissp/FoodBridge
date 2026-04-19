import { useRef } from 'react'
export default function OTPInput({ value, onChange, length=6, disabled=false }) {
  const refs = useRef([])
  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g,'').slice(-1)
    const arr = value.split(''); arr[i]=v; onChange(arr.join(''))
    if(v && i<length-1) refs.current[i+1]?.focus()
  }
  const handleKeyDown = (i, e) => { if(e.key==='Backspace'&&!value[i]&&i>0) refs.current[i-1]?.focus() }
  const handlePaste = (e) => {
    e.preventDefault()
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,length)
    onChange(p.padEnd(length,'').slice(0,length))
    refs.current[Math.min(p.length,length-1)]?.focus()
  }
  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({length}).map((_,i) => (
        <input key={i} ref={el=>refs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={value[i]||''}
          onChange={e=>handleChange(i,e)} onKeyDown={e=>handleKeyDown(i,e)} disabled={disabled}
          className={`w-12 h-14 text-center rounded-card border-2 font-mono text-xl font-bold text-text-primary bg-white transition-all duration-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 ${value[i]?'border-primary bg-primary-light':'border-surface-border'}`}/>
      ))}
    </div>
  )
}
