// ==========================================
// My Trips Page - Traveloop
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import {
  Plus, Search, Filter, MapPin, Calendar, Users, Clock,
  CheckCircle, FileEdit, TrendingUp, Trash2, Edit3,
  MoreVertical, ChevronRight, Loader2
} from 'lucide-react';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTrips();
  }, [activeFilter]);

  const loadTrips = async () => {
    try {
      const params = {};
      if (activeFilter !== 'all') params.status = activeFilter;
      const { data } = await tripAPI.getAll(params);
      if (data.success) setTrips(data.trips);
    } catch (err) {
      console.error('Load trips error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await tripAPI.delete(id);
      setTrips(trips.filter(t => t._id !== id));
    } catch (err) {
      console.error('Delete trip error:', err);
    }
  };

  const filters = [
    { key: 'all', label: 'All Trips' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'draft', label: 'Drafts' },
  ];

  const getStatusConfig = (status) => {
    const config = {
      upcoming: { label: 'Upcoming', icon: Calendar, bg: 'bg-blue-100', text: 'text-blue-700' },
      completed: { label: 'Completed', icon: CheckCircle, bg: 'bg-emerald-100', text: 'text-emerald-700' },
      draft: { label: 'Draft', icon: FileEdit, bg: 'bg-amber-100', text: 'text-amber-700' },
      active: { label: 'Active', icon: TrendingUp, bg: 'bg-purple-100', text: 'text-purple-700' },
    };
    return config[status] || config.draft;
  };

  const tripImages = [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80',
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=600&q=80',
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredTrips = trips.filter(t =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destinations?.some(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">My Trips</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all your travel plans</p>
        </div>
        <Link
          to="/dashboard/trips/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary-600/25 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => { setActiveFilter(f.key); setLoading(true); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === f.key
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip, i) => {
            const sc = getStatusConfig(trip.status);
            const StatusIcon = sc.icon;
            const duration = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={trip._id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <Link to={`/dashboard/trips/${trip._id}`}>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={trip.coverImage || tripImages[i % tripImages.length]}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 ${sc.bg} rounded-lg`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${sc.text}`} />
                      <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/dashboard/trips/${trip._id}`}>
                    <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">{trip.title}</h3>
                  </Link>
                  <p className="text-xs text-slate-500 mb-3">
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.destinations?.length || 0} Cities</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration} Days</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      {trip.travelers?.slice(0, 3).map((t, j) => (
                        <div key={j} className={`w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-[9px] font-bold border-2 border-white ${j > 0 ? '-ml-1.5' : ''}`}>
                          {t.user?.firstName?.[0]}{t.user?.lastName?.[0]}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/dashboard/trips/${trip._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(trip._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <MapPin className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 mb-2">
            {activeFilter === 'all' ? 'No trips yet' : `No ${activeFilter} trips`}
          </h3>
          <p className="text-slate-500 mb-6">Start planning your next adventure!</p>
          <Link
            to="/dashboard/trips/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Trip
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyTrips;
