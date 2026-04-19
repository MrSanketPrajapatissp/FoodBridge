const BASE = import.meta.env.VITE_API_URL
const headers = (isForm=false) => {
  const t = localStorage.getItem('access_token')
  const h = {}
  if(t) h['Authorization'] = `Bearer ${t}`
  if(!isForm) h['Content-Type'] = 'application/json'
  return h
}
const handle = async (res) => {
  if(res.status===401){ localStorage.clear(); window.location.href='/login'; return }
  if(res.status===403){ window.location.href='/profile'; return }
  return res
}
export const api = {
  get:   (ep)        => fetch(`${BASE}${ep}`,{headers:headers()}).then(handle),
  post:  (ep,d,f=false) => fetch(`${BASE}${ep}`,{method:'POST', headers:headers(f), body:f?d:JSON.stringify(d)}).then(handle),
  put:   (ep,d,f=false) => fetch(`${BASE}${ep}`,{method:'PUT',  headers:headers(f), body:f?d:JSON.stringify(d)}).then(handle),
  patch: (ep,d)      => fetch(`${BASE}${ep}`,{method:'PATCH', headers:headers(), body:JSON.stringify(d)}).then(handle),
}
