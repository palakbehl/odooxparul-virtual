// ==========================================
// Discover Page - Traveloop
// ==========================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { destinationAPI } from '../../services/api';
import {
  Search, Star, MapPin, DollarSign, Calendar, Globe,
  Flame, TrendingUp, ChevronRight, Loader2, Sparkles
} from 'lucide-react';

const Discover = () => {
  const [searchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadDestinations();
  }, [activeCategory]);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearchQuery(q);
      searchDestinations(q);
    }
  }, [searchParams]);

  const loadDestinations = async () => {
    try {
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      const { data } = await destinationAPI.getAll(params);
      if (data.success) {
        setDestinations(data.destinations);
      } else {
        // Try seeding
        await destinationAPI.seed();
        const retry = await destinationAPI.getAll(params);
        if (retry.data.success) setDestinations(retry.data.destinations);
      }
    } catch (err) {
      console.error('Load destinations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchDestinations = async (query) => {
    setLoading(true);
    try {
      const { data } = await destinationAPI.getAll({ search: query });
      if (data.success) setDestinations(data.destinations);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchDestinations(searchQuery);
    } else {
      loadDestinations();
    }
  };

  const categories = [
    { key: 'all', label: 'All', icon: Globe },
    { key: 'popular', label: 'Popular', icon: Star },
    { key: 'trending', label: 'Trending', icon: Flame },
    { key: 'hidden-gem', label: 'Hidden Gems', icon: Sparkles },
    { key: 'budget', label: 'Budget', icon: DollarSign },
    { key: 'luxury', label: 'Luxury', icon: TrendingUp },
  ];

  const getCategoryBadge = (category) => {
    const config = {
      popular: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Star },
      trending: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Flame },
      'hidden-gem': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Sparkles },
      budget: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: DollarSign },
      luxury: { bg: 'bg-amber-100', text: 'text-amber-700', icon: TrendingUp },
    };
    return config[category] || config.popular;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Discover</h1>
        <p className="text-slate-500 text-sm mt-1">Explore amazing destinations around the world</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations by name or country..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all shadow-sm"
          />
        </div>
      </form>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(c => {
          const CatIcon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => { setActiveCategory(c.key); setLoading(true); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === c.key
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CatIcon className="w-4 h-4" />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : destinations.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((dest) => {
            const badge = getCategoryBadge(dest.category);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={dest._id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={dest.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80'}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 ${badge.bg} rounded-lg`}>
                    <BadgeIcon className={`w-3.5 h-3.5 ${badge.text}`} />
                    <span className={`text-xs font-semibold ${badge.text} capitalize`}>{dest.category}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{dest.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{dest.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" /> {dest.country}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">{dest.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>From ${dest.averageBudget?.toLocaleString() || '1,000'}</span>
                    </div>
                    {dest.bestTimeToVisit && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dest.bestTimeToVisit.split(',')[0]}</span>
                      </div>
                    )}
                  </div>
                  {dest.highlights?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {dest.highlights.slice(0, 3).map((h, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] text-slate-500 font-medium">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No destinations found</h3>
          <p className="text-slate-500">Try a different search or category</p>
        </div>
      )}
    </div>
  );
};

export default Discover;
