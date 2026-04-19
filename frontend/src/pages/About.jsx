import { Link } from 'react-router-dom'
import { Heart, Globe, Users, Leaf, Target } from 'lucide-react'
import Layout from '../components/Layout'

const TEAM = [
  { name: 'Community First', role: 'Our Mission', desc: 'To eliminate food waste by building the fastest, most trusted bridge between surplus food and those who need it most.' },
  { name: 'Open & Accountable', role: 'Our Values', desc: 'Every donation, every claim, every pickup is transparent and auditable. Trust is not assumed — it\'s earned.' },
  { name: 'Zero Barrier', role: 'Our Goal', desc: 'Make food donation as easy as posting a photo. Make food access as quick as one OTP code.' },
]

export default function About() {
  return (
    <Layout>
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-white to-emerald-50">
        <div className="section-container text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"><Leaf size={32}/></div>
          <h1 className="font-heading font-black text-5xl text-text-primary mb-6">About FoodBridge</h1>
          <p className="font-body text-lg text-text-secondary leading-relaxed">
            FoodBridge was born from a simple observation: every day, tonnes of perfectly good food goes to waste while millions go hungry. We built the technology to close that gap — for good.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map(({ name, role, desc }) => (
              <div key={name} className="card p-8 text-center">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary block mb-3">{role}</span>
                <h3 className="font-heading font-bold text-xl mb-4">{name}</h3>
                <p className="font-body text-text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-surface-muted">
        <div className="section-container max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl mb-6">The Problem We Solve</h2>
          <div className="space-y-4 text-left">
            {[
              { icon: Globe, text: '1/3 of all food produced globally is wasted — that\'s 1.3 billion tonnes per year.' },
              { icon: Users, text: '828 million people go to bed hungry every night, even in food-abundant regions.' },
              { icon: Target, text: 'Bridging this gap requires speed, trust, and a frictionless connection — that\'s FoodBridge.' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-4 card p-5">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0"><Icon size={20}/></div>
                <p className="font-body text-text-secondary">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn-primary flex items-center gap-2"><Heart size={18}/> Join the Movement</Link>
            <Link to="/donations" className="btn-secondary">Browse Food</Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
