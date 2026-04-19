export default function Button({ children, variant='primary', size='md', loading=false, disabled=false, onClick, type='button', className='', ariaLabel }) {
  const base = 'inline-flex items-center justify-center gap-2 font-heading font-bold rounded-button transition-all duration-200 focus:outline-none focus:ring-4'
  const variants = {
    primary:   'bg-primary hover:bg-primary-dark text-white shadow-button hover:shadow-md focus:ring-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    secondary: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    danger:    'bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:ring-red-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  }
  const sizes = { sm:'px-5 py-2 text-sm', md:'px-8 py-3.5 text-base', lg:'px-10 py-4 text-lg' }
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading} aria-label={ariaLabel} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Loading...</>) : children}
    </button>
  )
}
