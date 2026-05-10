// ==========================================
// Discover Page - Traveloop
// Places powered by Places API
// ==========================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placesAPI } from '../../services/api';
import {
  Search, X, MapPin, Star, Clock, DollarSign,
  ChevronLeft, ChevronRight, Loader2, Heart,
  Compass, Plane, ExternalLink, Tag, Users
} from 'lucide-react';

const CATS = ['All', 'Adventure', 'Beaches', 'Mountains', 'Heritage', 'Food & Culture', 'Museums', 'Shopping', 'Nightlife'];
const DEFAULT_CITIES = ['paris', 'tokyo', 'dubai', 'london', 'india'];

const Discover = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('All');
  const [page, setPage] = useState(1);
  const [fav, setFav] = useState(new Set());
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const PER = 9;

  useEffect(() => { loadDefaults(); }, []);

  const loadDefaults = async () => {
    setLoading(true);
    try {
      const responses = await Promise.allSettled(
        DEFAULT_CITIES.map(city => placesAPI.attractions(city, 'tourist attractions'))
      );
      const combined = [];
      responses.forEach(r => {
        if (r.status === 'fulfilled' && r.value.data?.success) {
          combined.push(...(r.value.data.results || []));
        }
      });
      setResults(combined.length > 0 ? combined : getFallbackResults());
    } catch (e) {
      console.error(e);
      setResults(getFallbackResults());
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (overrideQ) => {
    const term = overrideQ ?? query;
    if (!term.trim()) return loadDefaults();
    setLoading(true);
    setPage(1);
    try {
      const categoryParam = cat !== 'All' ? cat : 'tourist attractions';
      const { data } = await placesAPI.attractions(term.trim(), categoryParam);
      if (data.success) {
        setResults(data.results?.length > 0 ? data.results : getFallbackResults(term));
      }
    } catch (e) {
      console.error(e);
      setResults(getFallbackResults(term));
    } finally {
      setLoading(false);
    }
  };

  const handleCatChange = (newCat) => {
    setCat(newCat);
    setPage(1);
    if (query.trim()) setTimeout(() => handleSearch(query), 0);
  };

  const toggleFav = (name) => {
    setFav(prev => { const s = new Set(prev); s.has(name) ? s.delete(name) : s.add(name); return s; });
  };

  const sorted = [...results].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'price_low') return (a.estimatedPrice || 0) - (b.estimatedPrice || 0);
    if (sortBy === 'price_high') return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
    return 0;
  });

  const paginated = sorted.slice((page - 1) * PER, page * PER);
  const totalPages = Math.ceil(sorted.length / PER) || 1;

  const tags = ['Popular', 'Top Rated', 'Trending'];
  const tagColors = { Popular: 'bg-primary-50 text-primary-700', 'Top Rated': 'bg-amber-50 text-amber-700', Trending: 'bg-emerald-50 text-emerald-700' };
  const tagEmoji = { Popular: '🔥', 'Top Rated': '⭐', Trending: '📈' };

  // Navigate to CreateTrip with auto-filled data
  const handlePlanTrip = (place) => {
    const params = new URLSearchParams({
      destination: place.name || '',
      title: `Trip to ${place.name || 'Unknown'}`,
      budget: place.estimatedPrice ? String(place.estimatedPrice * 3) : '',
      description: place.description || `Explore ${place.name} — a must-visit ${place.category?.toLowerCase() || 'destination'}.`,
      tripType: mapCategoryToTripType(place.category),
    });
    setSelectedPlace(null);
    navigate(`/dashboard/trips/new?${params.toString()}`);
  };

  const mapCategoryToTripType = (category) => {
    if (!category) return 'Leisure';
    const c = category.toLowerCase();
    if (c.includes('adventure')) return 'Adventure';
    if (c.includes('food')) return 'Leisure';
    if (c.includes('heritage') || c.includes('museum')) return 'Leisure';
    if (c.includes('beach')) return 'Leisure';
    return 'Leisure';
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Discover Places</h1>
        <p className="text-slate-500 mt-1 text-sm">Explore amazing destinations and things to do around the world</p>
      </div>

      {/* Search + Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search a city, country or place…"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
            {query && (
              <button onClick={() => { setQuery(''); loadDefaults(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => handleSearch()} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4" /> Search
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:border-primary-400 outline-none">
            <option value="recommended">⬆ Recommended</option>
            <option value="rating">⭐ Top Rated</option>
            <option value="price_low">💰 Price: Low</option>
            <option value="price_high">💰 Price: High</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map(c => (
            <button key={c} onClick={() => handleCatChange(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${cat === c ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-800">{sorted.length}</span> places
          {query && <span> for "<span className="text-primary-600 font-medium">{query}</span>"</span>}
        </p>
        <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-slate-400 text-sm">Discovering amazing places…</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center shadow-sm">
          <Compass className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No places found</h3>
          <p className="text-slate-500 text-sm mb-4">Try searching a different city like "Paris", "Tokyo" or "Dubai"</p>
          <button onClick={() => { setQuery(''); loadDefaults(); }} className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
            Show Popular Places
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {paginated.map((r, i) => {
            const tag = tags[i % 3];
            const isFav = fav.has(r.name);
            const defaultImg = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80`;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="relative h-44 overflow-hidden">
                  <img src={r.image || defaultImg} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.src = defaultImg; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold ${tagColors[tag]} bg-white/90 backdrop-blur-sm`}>
                    {tagEmoji[tag]} {tag}
                  </span>
                  <button onClick={() => toggleFav(r.name)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFav ? 'bg-red-500 text-white shadow-lg' : 'bg-white/80 text-slate-400 hover:text-red-500 backdrop-blur-sm'}`}>
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                  </button>
                  {r.category && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white rounded-full text-[10px] font-medium">
                      {r.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1">{r.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">{r.country || r.address || 'Unknown location'}</span>
                  </p>
                  {r.rating > 0 && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= Math.round(r.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{r.rating}</span>
                      {r.reviews > 0 && <span className="text-xs text-slate-400">({r.reviews.toLocaleString()})</span>}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {r.description || `Discover ${r.name} — a must-visit ${r.category?.toLowerCase() || 'attraction'} that offers an unforgettable experience.`}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {r.estimatedPrice !== undefined && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {r.estimatedPrice === 0 ? 'Free' : `₹${r.estimatedPrice?.toLocaleString()}`}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 1–3 hrs</span>
                    </div>
                    <button
                      onClick={() => setSelectedPlace(r)}
                      className="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-xl text-xs font-semibold hover:bg-primary-600 hover:text-white transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${page === p ? 'bg-primary-600 text-white shadow-sm' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
              {p}
            </button>
          ))}
          {totalPages > 7 && <span className="text-slate-400 text-sm">…{totalPages}</span>}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===== PLACE DETAIL MODAL ===== */}
      {selectedPlace && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setSelectedPlace(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Hero Image */}
              <div className="relative h-56 flex-shrink-0">
                <img
                  src={selectedPlace.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Close button */}
                <button onClick={() => setSelectedPlace(null)}
                  className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                  <X className="w-5 h-5 text-slate-700" />
                </button>

                {/* Fav button */}
                <button onClick={() => toggleFav(selectedPlace.name)}
                  className={`absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${fav.has(selectedPlace.name) ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500 backdrop-blur-sm'}`}>
                  <Heart className={`w-4 h-4 ${fav.has(selectedPlace.name) ? 'fill-white' : ''}`} />
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-4 left-5 right-5">
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedPlace.name}</h2>
                  <p className="flex items-center gap-1.5 text-white/80 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedPlace.country || selectedPlace.address || 'Unknown location'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-6">
                {/* Rating & Category */}
                <div className="flex items-center gap-3 mb-4">
                  {selectedPlace.rating > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-amber-700">{selectedPlace.rating}</span>
                      {selectedPlace.reviews > 0 && (
                        <span className="text-xs text-amber-600">({selectedPlace.reviews.toLocaleString()} reviews)</span>
                      )}
                    </div>
                  )}
                  {selectedPlace.category && (
                    <div className="flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-xl">
                      <Tag className="w-3.5 h-3.5 text-primary-600" />
                      <span className="text-xs font-semibold text-primary-700">{selectedPlace.category}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">About this place</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedPlace.description || `${selectedPlace.name} is a must-visit ${selectedPlace.category?.toLowerCase() || 'destination'} that offers an unforgettable experience. Whether you're traveling solo, with family, or friends, this place has something for everyone. From stunning views to rich cultural experiences, you'll create memories that last a lifetime.`}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <DollarSign className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-900">
                      {selectedPlace.estimatedPrice === 0 ? 'Free' : `₹${selectedPlace.estimatedPrice?.toLocaleString() || 'N/A'}`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Est. Cost</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-900">1–3 hrs</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Duration</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-900">All Ages</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Suitable</p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Scenic Views', 'Photo Worthy', 'Cultural Experience', 'Family Friendly'].map(h => (
                      <span key={h} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {h}
                      </span>
                    ))}
                    {selectedPlace.category && (
                      <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">
                        {selectedPlace.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-amber-700 mb-1">💡 Travel Tip</p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    Visit {selectedPlace.name} during early morning or late afternoon for the best experience. Don't forget to carry water and comfortable shoes!
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 p-5 border-t border-slate-100 bg-white flex-shrink-0">
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePlanTrip(selectedPlace)}
                  className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary-600/25"
                >
                  <Plane className="w-4 h-4" /> Plan a Trip Here
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const getFallbackResults = () => [
  { name: 'Eiffel Tower', country: 'Paris, France', rating: 4.8, reviews: 342, category: 'Landmark', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', estimatedPrice: 2500, description: 'Iconic iron lattice tower on the Champ de Mars in Paris.' },
  { name: 'Taj Mahal', country: 'Agra, India', rating: 4.9, reviews: 2500, category: 'Heritage', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80', estimatedPrice: 1100, description: 'A UNESCO World Heritage site and one of the Seven Wonders of the World.' },
  { name: 'Burj Khalifa', country: 'Dubai, UAE', rating: 4.9, reviews: 1200, category: 'Activity', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', estimatedPrice: 4500, description: "The world's tallest building offering breathtaking panoramic views." },
  { name: 'Colosseum', country: 'Rome, Italy', rating: 4.7, reviews: 980, category: 'Heritage', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80', estimatedPrice: 2000, description: 'Ancient amphitheater in the center of Rome with a rich history.' },
  { name: 'Santorini Sunset', country: 'Santorini, Greece', rating: 4.8, reviews: 760, category: 'Beaches', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80', estimatedPrice: 0, description: 'Famous for its dramatic views, white-washed buildings, and volcanic beaches.' },
  { name: 'Machu Picchu', country: 'Cusco, Peru', rating: 4.9, reviews: 1100, category: 'Adventure', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80', estimatedPrice: 5000, description: 'Ancient Inca citadel set high in the Andes Mountains.' },
  { name: 'Sensoji Temple', country: 'Tokyo, Japan', rating: 4.7, reviews: 890, category: 'Heritage', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', estimatedPrice: 0, description: "Tokyo's oldest and most significant Buddhist temple." },
  { name: 'Safari Experience', country: 'Nairobi, Kenya', rating: 4.8, reviews: 540, category: 'Adventure', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80', estimatedPrice: 12000, description: 'Witness the Great Migration and the Big Five on an African safari.' },
  { name: 'Louvre Museum', country: 'Paris, France', rating: 4.7, reviews: 512, category: 'Museums', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80', estimatedPrice: 2200, description: "World's largest art museum and home to the Mona Lisa." },
];

export default Discover;
