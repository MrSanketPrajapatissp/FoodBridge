import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-footer text-white/70 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-heading font-bold text-white text-lg mb-4">FoodBridge</h3>
            <p className="font-body text-white/70 mb-4 text-sm leading-relaxed">Connecting food donors with verified NGOs to reduce food waste and help communities.</p>
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-lg mb-4">Quick Links</h3>
            <Link to="/about" className="font-body text-white/70 hover:text-white/90 transition-colors block mb-2 text-sm">About Us</Link>
            <Link to="/about" className="font-body text-white/70 hover:text-white/90 transition-colors block mb-2 text-sm">How it Works</Link>
            <Link to="/donations" className="font-body text-white/70 hover:text-white/90 transition-colors block mb-2 text-sm">Find Food</Link>
            <Link to="/donate" className="font-body text-white/70 hover:text-white/90 transition-colors block mb-2 text-sm">Donate Food</Link>
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-lg mb-4">Support</h3>
            <Link to="/about" className="font-body text-white/70 hover:text-white/90 transition-colors block mb-2 text-sm">FAQs</Link>
            <Link to="/about" className="font-body text-white/70 hover:text-white/90 transition-colors block mb-2 text-sm">Contact Us</Link>
            <Link to="/about" className="font-body text-white/70 hover:text-white/90 transition-colors block mb-2 text-sm">Donation Guidelines</Link>
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-lg mb-4">Legal</h3>
            <Link to="/about" className="font-body text-white/70 hover:text-white/90 transition-colors block mb-2 text-sm">Privacy Policy</Link>
            <Link to="/about" className="font-body text-white/70 hover:text-white/90 transition-colors block mb-2 text-sm">Terms of Service</Link>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 mt-12 text-center text-white/50 text-sm font-body flex flex-col items-center justify-center gap-2">
          <p className="flex items-center gap-1">Made with <Heart size={14} className="text-primary"/> for a better world</p>
          <p>&copy; {new Date().getFullYear()} FoodBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
