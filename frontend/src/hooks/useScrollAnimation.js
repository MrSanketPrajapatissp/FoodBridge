import { useEffect, useRef } from 'react'
export default function useScrollAnimation() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if(!el) return
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){ el.classList.add('visible'); obs.unobserve(el) }},{threshold:0.1})
    obs.observe(el); return () => obs.disconnect()
  },[])
  return ref
}
