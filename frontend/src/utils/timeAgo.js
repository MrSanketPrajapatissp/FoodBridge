export function timeAgo(d) {
  const s = Math.floor((Date.now()-new Date(d))/1000)
  if(s<60) return 'Just now'
  if(s<3600) return `${Math.floor(s/60)} min ago`
  if(s<86400) return `${Math.floor(s/3600)} hr ago`
  return `${Math.floor(s/86400)} days ago`
}
