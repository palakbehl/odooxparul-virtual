// ==========================================
// Landing Page - Traveloop
// ==========================================

import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  MapPin, Calendar, DollarSign, StickyNote, CheckSquare, Search,
  Users, ArrowRight, Star, Globe, Sparkles, ChevronRight, Plane,
  Heart, Share2, Compass, TrendingUp, Shield
} from 'lucide-react';

const Landing = () => {
  const features = [
    { icon: Calendar, title: 'Itinerary Planning', desc: 'Create detailed day-by-day itineraries with maps, timings, and notes for every destination.', color: 'from-blue-500 to-cyan-500' },
    { icon: DollarSign, title: 'Budget Tracking', desc: 'Track expenses in real-time, set budgets, and never overspend on your adventures.', color: 'from-emerald-500 to-teal-500' },
    { icon: StickyNote, title: 'Travel Notes', desc: 'Capture memories, tips, and important details in beautifully organized travel journals.', color: 'from-amber-500 to-orange-500' },
    { icon: CheckSquare, title: 'Packing Checklist', desc: 'Smart packing lists that adapt to your destination, weather, and trip duration.', color: 'from-violet-500 to-purple-500' },
    { icon: Search, title: 'Activity Search', desc: 'Discover local attractions, restaurants, and hidden gems at every destination.', color: 'from-pink-500 to-rose-500' },
    { icon: Share2, title: 'Community Sharing', desc: 'Share your trips, get inspired by others, and build your travel community.', color: 'from-indigo-500 to-blue-500' },
  ];

  const stats = [
    { value: '50K+', label: 'Active Travelers' },
    { value: '120+', label: 'Countries Covered' },
    { value: '1M+', label: 'Trips Planned' },
    { value: '4.9', label: 'App Rating', icon: Star },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Travel Blogger', text: 'Traveloop completely transformed how I plan my trips. The itinerary builder is incredible!', avatar: 'SC' },
    { name: 'Marcus Rivera', role: 'Digital Nomad', text: 'The budget tracking saved me thousands. I can see exactly where my money goes on every trip.', avatar: 'MR' },
    { name: 'Aisha Patel', role: 'Solo Traveler', text: 'The community feature helped me connect with fellow travelers and discover hidden gems.', avatar: 'AP' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/70" />

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-600/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white/80 font-medium">Your smart travel companion</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-tight mb-6">
                <span className="text-white">Plan Smarter.</span>
                <br />
                <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-accent-400 bg-clip-text text-transparent">
                  Travel Better.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Create stunning itineraries, track budgets, and share adventures with a community of travelers worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-600/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                  Start Planning Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                  <Globe className="w-5 h-5" />
                  Explore Features
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/10">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="flex items-center gap-1 justify-center lg:justify-start">
                      <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
                      {stat.icon && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                    </div>
                    <span className="text-sm text-slate-400">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Floating Cards */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[500px]">
                {/* Main Card */}
                <div className="absolute top-8 right-0 w-80 bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl animate-float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Santorini, Greece</h4>
                      <p className="text-slate-400 text-sm">7 days itinerary</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center"><CheckSquare className="w-4 h-4 text-emerald-400" /></div>
                      <span className="text-slate-300 text-sm">Hotel booked</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center"><Plane className="w-4 h-4 text-blue-400" /></div>
                      <span className="text-slate-300 text-sm">Flights confirmed</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-amber-400" /></div>
                      <span className="text-slate-300 text-sm">Budget: $2,400</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Card */}
                <div className="absolute bottom-12 left-0 w-64 bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl animate-float-delayed">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-sm">Budget on Track</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5 mb-2">
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2.5 rounded-full" style={{ width: '65%' }} />
                  </div>
                  <p className="text-slate-400 text-xs">$1,560 of $2,400 spent</p>
                </div>

                {/* Small badge */}
                <div className="absolute top-48 left-8 bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/20 flex items-center gap-2 animate-bounce-slow">
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  <span className="text-white text-sm font-medium">2.4k likes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-20 lg:py-28 relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-900 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-4">
              <Compass className="w-4 h-4 text-primary-600" />
              <span className="text-sm text-primary-600 font-semibold">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-slate-900 mb-4">
              Everything you need to{' '}
              <span className="text-gradient">plan your trip</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From itinerary building to budget tracking, we've got every aspect of your journey covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group bg-white rounded-2xl p-7 border border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-xl hover:shadow-primary-100/50 hover:-translate-y-1 transition-all duration-500">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRIP PLANNING PREVIEW ===== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 rounded-full mb-4">
                <Calendar className="w-4 h-4 text-accent-600" />
                <span className="text-sm text-accent-600 font-semibold">Trip Planning</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mb-5">
                Build your perfect{' '}
                <span className="text-gradient">itinerary</span>
              </h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                Drag and drop activities, set timings, add notes, and create the perfect plan for every day of your trip.
              </p>
              <div className="space-y-4">
                {['Drag & drop itinerary builder', 'Auto-suggest popular activities', 'Real-time collaboration', 'Offline access to your plans'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-600/25 hover:-translate-y-0.5 transition-all duration-300">
                Try It Free <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Preview Card */}
            <div className="relative">
              <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-slate-900">Bali Adventure</h4>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Active</span>
                </div>
                {[
                  { day: 'Day 1', title: 'Arrive in Ubud', time: '9:00 AM', color: 'bg-blue-500' },
                  { day: 'Day 2', title: 'Rice Terraces Tour', time: '7:30 AM', color: 'bg-emerald-500' },
                  { day: 'Day 3', title: 'Temple Visits', time: '8:00 AM', color: 'bg-amber-500' },
                  { day: 'Day 4', title: 'Beach Day in Seminyak', time: '10:00 AM', color: 'bg-pink-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl mb-3 border border-slate-100 hover:shadow-md transition-shadow">
                    <div className={`w-1.5 h-12 ${item.color} rounded-full`} />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 font-medium">{item.day}</p>
                      <p className="text-slate-900 font-semibold">{item.title}</p>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">{item.time}</span>
                  </div>
                ))}
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-100 rounded-full blur-2xl opacity-60" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent-100 rounded-full blur-2xl opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMMUNITY SECTION ===== */}
      <section id="community" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-4">
              <Users className="w-4 h-4 text-primary-600" />
              <span className="text-sm text-primary-600 font-semibold">Community</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-slate-900 mb-4">
              Loved by travelers{' '}
              <span className="text-gradient">worldwide</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Join a community of passionate travelers sharing their experiences and inspiring each other.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white mb-6">
            Ready to start your next adventure?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of travelers who plan smarter and travel better with Traveloop.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="group px-8 py-4 bg-white text-primary-700 rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
