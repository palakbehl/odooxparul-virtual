// ==========================================
// Dashboard Home Page - Traveloop
// Matches reference: hero banner, search, destinations, trips
// ==========================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tripAPI, destinationAPI } from '../../services/api';
import {
  Search, Globe, ChevronRight, MapPin, Calendar, Users, Star,
  Flame, TrendingUp, Filter, ArrowDownUp, LayoutGrid,
  Clock, CheckCircle, FileEdit, MoreHorizontal, Plus
} from 'lucide-react';

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashRes, destRes] = await Promise.all([
        tripAPI.getDashboardStats().catch(() => ({ data: { stats: null, recentTrips: [] } })),
        destinationAPI.getAll({ limit: 10 }).catch(() => ({ data: { destinations: [] } }))
      ]);

      if (dashRes.data.success) {
        setStats(dashRes.data.stats);
        setRecentTrips(dashRes.data.recentTrips || []);
      }

      if (destRes.data.success) {
        setDestinations(destRes.data.destinations || []);
      } else {
        // Try seeding destinations
        await destinationAPI.seed();
        const retry = await destinationAPI.getAll({ limit: 10 });
        if (retry.data.success) setDestinations(retry.data.destinations || []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/discover?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusConfig = (status) => {
    const config = {
      upcoming: { label: 'Upcoming', icon: Calendar, bgColor: 'bg-blue-100', textColor: 'text-blue-700', iconColor: 'text-blue-500' },
      completed: { label: 'Completed', icon: CheckCircle, bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', iconColor: 'text-emerald-500' },
      draft: { label: 'Draft', icon: FileEdit, bgColor: 'bg-amber-100', textColor: 'text-amber-700', iconColor: 'text-amber-500' },
      active: { label: 'Active', icon: TrendingUp, bgColor: 'bg-purple-100', textColor: 'text-purple-700', iconColor: 'text-purple-500' },
      cancelled: { label: 'Cancelled', icon: Clock, bgColor: 'bg-red-100', textColor: 'text-red-700', iconColor: 'text-red-500' },
    };
    return config[status] || config.draft;
  };

  // Fallback hero images
  const heroImage = 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=1400&q=80';

  // Destination images fallback
  const destImages = [
    'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&q=80',
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
    'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    'https://images.unsplash.com/photo-1583997052103-b4a1cb974ce5?w=600&q=80',
  ];

  // Trip cover images fallback
  const tripImages = [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80',
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80',
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-14 bg-slate-200 rounded-2xl max-w-2xl" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-56 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ===== HERO BANNER ===== */}
      <div className="relative rounded-3xl overflow-hidden h-[260px] sm:h-[280px]">
        <img
          src={heroImage}
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-3 leading-tight">
            Let's Plan Your<br />Next Adventure
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-md leading-relaxed">
            Discover places, plan smart itineraries and create unforgettable memories.
          </p>
          <Link
            to="/dashboard/trips/new"
            className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5 transition-all duration-300 w-fit"
          >
            <Plus className="w-4 h-4" />
            Plan a Trip
          </Link>
        </div>
      </div>

      {/* ===== SEARCH BAR ===== */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[280px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, activities, or trips..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all shadow-sm"
            />
          </div>
        </form>
        <button className="flex items-center gap-2 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <LayoutGrid className="w-4 h-4" />
          Group by
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90" />
        </button>
        <button className="flex items-center gap-2 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button className="flex items-center gap-2 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowDownUp className="w-4 h-4" />
          Sort by
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90" />
        </button>
      </div>

      {/* ===== TOP REGIONAL SELECTIONS ===== */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold font-display text-slate-900">Top Regional Selections</h2>
          </div>
          <Link
            to="/dashboard/discover"
            className="flex items-center gap-1 text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(destinations.length > 0 ? destinations.slice(0, 5) : [
            { name: 'Santorini', country: 'Greece', category: 'popular' },
            { name: 'Krabi', country: 'Thailand', category: 'popular' },
            { name: 'Tokyo', country: 'Japan', category: 'trending' },
            { name: 'Banff', country: 'Canada', category: 'popular' },
            { name: 'Cartagena', country: 'Colombia', category: 'trending' },
          ]).map((dest, i) => (
            <Link
              key={dest._id || i}
              to={dest._id ? `/dashboard/discover?search=${dest.name}` : '/dashboard/discover'}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] mb-3">
                <img
                  src={dest.image || destImages[i % destImages.length]}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{dest.name}</h3>
              <p className="text-xs text-slate-500">{dest.country}</p>
              <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                dest.category === 'trending'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {dest.category === 'trending' ? (
                  <><Flame className="w-3 h-3" />Trending</>
                ) : (
                  <><Star className="w-3 h-3" />Popular</>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== PREVIOUS TRIPS ===== */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold font-display text-slate-900">Previous Trips</h2>
          </div>
          <Link
            to="/dashboard/trips"
            className="flex items-center gap-1 text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTrips.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentTrips.map((trip, i) => {
              const statusConfig = getStatusConfig(trip.status);
              const StatusIcon = statusConfig.icon;
              const duration = trip.duration || Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
              const cities = trip.destinations?.length || 0;

              return (
                <Link
                  key={trip._id}
                  to={`/dashboard/trips/${trip._id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={trip.coverImage || tripImages[i % tripImages.length]}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 ${statusConfig.bgColor} rounded-lg`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.iconColor}`} />
                      <span className={`text-xs font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">{trip.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {cities > 0 && <span>{cities} {cities === 1 ? 'City' : 'Cities'}</span>}
                        <span>•</span>
                        <span>{duration} Days</span>
                      </div>
                      <div className="flex items-center">
                        {trip.travelers?.slice(0, 3).map((t, j) => (
                          <div
                            key={j}
                            className={`w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white ${j > 0 ? '-ml-2' : ''}`}
                          >
                            {t.user?.firstName?.[0] || '?'}{t.user?.lastName?.[0] || ''}
                          </div>
                        ))}
                        {(trip.travelers?.length || 0) > 3 && (
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold border-2 border-white -ml-2">
                            +{trip.travelers.length - 3}
                          </div>
                        )}
                        <button className="ml-2 p-1 rounded-full hover:bg-slate-100 text-slate-400">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <MapPin className="w-10 h-10 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 mb-2">No trips yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Start planning your first adventure! Create a trip to organize your destinations, activities, and budget.
            </p>
            <Link
              to="/dashboard/trips/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary-600/25 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Plan Your First Trip
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardHome;
