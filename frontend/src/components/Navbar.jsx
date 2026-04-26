import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, User, Bell, LogOut, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('user_role')
    const name = localStorage.getItem('user_name')
    if (token) {
      setUser({ role, name })
      import('../utils/api').then(({ api }) => {
        api.get('/notifications/unread-count/').then(res => {
          if (res) res.json().then(data => setUnreadCount(data.count || 0))
        })
      })
    }
    else setUser(null)
    setDropdownOpen(false)
    setIsOpen(false)
  }, [location])

  const logout = () => {
    localStorage.clear()
    setUser(null)
    navigate('/login')
  }

  const navLink = "relative py-2 text-sm font-medium text-text-primary hover:text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200"

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-surface-border shadow-nav h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-heading font-extrabold text-xl text-primary flex items-center gap-1.5">
          <span className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-black">FB</span>
          FoodBridge
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={navLink}>Home</Link>
          <Link to="/donations" className={navLink}>Find Food</Link>
          <Link to="/about" className={navLink}>About</Link>

          {user ? (
            <>
              {user.role === 'DONOR' && (
                <>
                  <Link to="/donate" className={navLink}>Donate</Link>
                  <Link to="/my-donations" className={navLink}>My Items</Link>
                </>
              )}
              {user.role === 'NGO' && (
                <Link to="/my-claims" className={navLink}>My Claims</Link>
              )}

              {/* Notification Bell */}
              <Link to="/notifications" className="relative p-2 text-text-secondary hover:text-primary transition-colors">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white font-mono text-xs">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 font-medium text-sm text-text-primary hover:text-primary transition-colors bg-surface-muted pl-3 pr-2 py-2 rounded-button"
                >
                  <User size={16} />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-card shadow-card-hover border border-surface-border py-1 animate-fade-up">
                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-text-primary hover:bg-surface-muted transition-colors"><User size={14} className="inline mr-2"/>Profile</Link>
                    {user.role === 'NGO' && <Link to="/org/profile" className="block px-4 py-2.5 text-sm text-text-primary hover:bg-surface-muted transition-colors">NGO Settings</Link>}
                    <Link to="/notifications" className="block px-4 py-2.5 text-sm text-text-primary hover:bg-surface-muted transition-colors"><Bell size={14} className="inline mr-2"/>Notifications</Link>
                    <hr className="my-1 border-surface-border"/>
                    <button onClick={logout} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"><LogOut size={14} className="inline mr-2"/>Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary px-5 py-2 text-sm">Login</Link>
              <Link to="/register" className="btn-primary px-5 py-2 text-sm">Register Free</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Menu" className="md:hidden text-text-primary hover:text-primary">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-surface-border shadow-lg">
          <div className="px-4 py-4 space-y-1">
            <Link to="/" className="block px-3 py-2.5 text-text-primary hover:text-primary hover:bg-surface-muted rounded-md text-sm font-medium" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/donations" className="block px-3 py-2.5 text-text-primary hover:text-primary hover:bg-surface-muted rounded-md text-sm font-medium" onClick={() => setIsOpen(false)}>Find Food</Link>
            <Link to="/about" className="block px-3 py-2.5 text-text-primary hover:text-primary hover:bg-surface-muted rounded-md text-sm font-medium" onClick={() => setIsOpen(false)}>About</Link>
            {user ? (
              <>
                {user.role === 'DONOR' && <>
                  <Link to="/donate" className="block px-3 py-2.5 text-text-primary hover:text-primary hover:bg-surface-muted rounded-md text-sm font-medium" onClick={() => setIsOpen(false)}>Donate</Link>
                  <Link to="/my-donations" className="block px-3 py-2.5 text-text-primary hover:text-primary hover:bg-surface-muted rounded-md text-sm font-medium" onClick={() => setIsOpen(false)}>My Items</Link>
                </>}
                {user.role === 'NGO' && <Link to="/my-claims" className="block px-3 py-2.5 text-text-primary hover:text-primary hover:bg-surface-muted rounded-md text-sm font-medium" onClick={() => setIsOpen(false)}>My Claims</Link>}
                <Link to="/notifications" className="block px-3 py-2.5 text-text-primary hover:text-primary hover:bg-surface-muted rounded-md text-sm font-medium flex justify-between items-center" onClick={() => setIsOpen(false)}>
                  Notifications
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                </Link>
                <Link to="/profile" className="block px-3 py-2.5 text-text-primary hover:text-primary hover:bg-surface-muted rounded-md text-sm font-medium" onClick={() => setIsOpen(false)}>Profile</Link>
                <button onClick={() => { logout(); setIsOpen(false) }} className="block w-full text-left px-3 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-md text-sm">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2.5 text-primary font-bold hover:bg-surface-muted rounded-md text-sm" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="block px-3 py-2.5 bg-primary text-white font-bold rounded-md text-sm" onClick={() => setIsOpen(false)}>Register Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
