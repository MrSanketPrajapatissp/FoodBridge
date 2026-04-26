import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Leaf,
  ShieldCheck,
  Zap,
  MapPin,
  UtensilsCrossed,
  ArrowRight,
  Users,
  Package,
  Clock,
} from "lucide-react";
import Layout from "../components/Layout";

const STEPS = [
  {
    step: "01",
    title: "Donors Post Food",
    desc: "Restaurants, caterers, or anyone with surplus food lists it in minutes with photos, quantity, and pickup time.",
    icon: UtensilsCrossed,
  },
  {
    step: "02",
    title: "NGOs Discover & Claim",
    desc: "Verified NGOs browse available food nearby and claim it instantly. No bureaucracy, no waiting.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Verify & Complete Pickup",
    desc: "The NGO shows a secure OTP code to the donor at pickup. One tap confirms the handover.",
    icon: Zap,
  },
];

const FEATURES = [
  {
    icon: Leaf,
    title: "Verified NGOs Only",
    desc: "Every organization is manually reviewed before they can claim food, ensuring accountability and food safety.",
  },
  {
    icon: MapPin,
    title: "Location-Based Matching",
    desc: "Auto-geocoding locates donations and matches verified NGOs within their service radius for efficient distribution.",
  },
  {
    icon: Clock,
    title: "Real-Time Availability",
    desc: "Donation listings update instantly. NGOs see what's available right now, not hours later.",
  },
  {
    icon: ShieldCheck,
    title: "Secure OTP Pickup",
    desc: "Every handover is cryptographically verified with a one-time password, creating a complete audit trail.",
  },
];

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    import("../utils/api").then(({ api }) => {
      api.get("/stats/").then((res) => {
        if (res) res.json().then((data) => setStats(data));
      });
    });
  }, []);

  const DISPLAY_STATS = [
    {
      icon: Package,
      value: stats ? `${stats.total_donations}` : "...",
      label: "Total Donations",
    },
    {
      icon: Users,
      value: stats ? `${stats.verified_ngos}` : "...",
      label: "Verified NGOs",
    },
    {
      icon: Zap,
      value: stats ? `${stats.completed_pickups}` : "...",
      label: "Completed Pickups",
    },
    {
      icon: Heart,
      value: stats
        ? `${stats.total_donations > 0 ? ((stats.completed_pickups / stats.total_donations) * 100).toFixed(0) : 0}%`
        : "...",
      label: "Success Rate",
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-emerald-50 pt-24 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="section-container relative text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8 animate-fade-up">
            <Leaf size={14} /> Fighting Food Waste Together
          </div>
          <h1 className="font-heading font-black text-5xl md:text-7xl text-text-primary leading-tight mb-6 animate-fade-up">
            Food Doesn't Have
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
              {" "}
              to Go to Waste
            </span>
          </h1>
          <p className="font-body text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 animate-fade-up">
            FoodBridge connects surplus food from restaurants, events, and homes
            directly to verified NGOs — making sure every meal reaches someone
            who needs it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up">
            <Link
              to="/register"
              className="btn-primary text-base px-8 py-4 flex items-center gap-2"
            >
              Start Donating <ArrowRight size={18} />
            </Link>
            <Link
              to="/donations"
              className="btn-secondary text-base px-8 py-4 flex items-center gap-2"
            >
              Browse Available Food <UtensilsCrossed size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-surface-border py-10">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {DISPLAY_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center animate-fade-up">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-3">
                  <Icon size={22} />
                </div>
                <p className="font-heading font-black text-3xl text-primary">
                  {value}
                </p>
                <p className="font-body text-sm text-text-secondary mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-surface-muted">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl text-text-primary mb-4">
              How FoodBridge Works
            </h2>
            <p className="font-body text-text-secondary max-w-xl mx-auto">
              Three simple steps transform excess food into community impact.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc, icon: Icon }) => (
              <div
                key={step}
                className="card p-8 text-center group hover:border-primary/30 transition-all"
              >
                <span className="font-mono font-black text-5xl text-primary/20 group-hover:text-primary/40 transition-colors block mb-4">
                  {step}
                </span>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-5">
                  <Icon size={28} />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">{title}</h3>
                <p className="font-body text-text-secondary text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl text-text-primary mb-4">
              Built for Trust & Speed
            </h2>
            <p className="font-body text-text-secondary max-w-xl mx-auto">
              Every feature designed to make food redistribution fast, safe, and
              accountable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-6 p-6 rounded-card border border-surface-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-2">
                    {title}
                  </h3>
                  <p className="font-body text-text-secondary text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary to-emerald-700 text-white">
        <div className="section-container text-center">
          <Heart size={48} className="mx-auto mb-6 opacity-80" />
          <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="font-body text-lg opacity-80 max-w-xl mx-auto mb-10">
            Join hundreds of donors and NGOs already using FoodBridge to reduce
            food waste and feed communities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-primary font-heading font-bold px-8 py-4 rounded-button hover:bg-primary-light transition-colors flex items-center gap-2"
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link
              to="/donations"
              className="border-2 border-white/40 text-white font-heading font-bold px-8 py-4 rounded-button hover:bg-white/10 transition-colors"
            >
              Browse Donations
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
