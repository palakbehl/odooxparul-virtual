// ==========================================
// Create Trip Page - Traveloop
// Matches reference: sidebar + form + suggestions
// ==========================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tripAPI, placesAPI } from '../../services/api';
import {
  ArrowLeft, MapPin, Calendar, Users, Plane, Plus, Loader2,
  CheckCircle, Heart, Star, Search, ChevronDown, Sparkles,
  Palmtree, Mountain, Landmark, Compass, UtensilsCrossed, X, FileText
} from 'lucide-react';

const TRIP_TYPES = ['Leisure', 'Adventure', 'Family', 'Solo', 'Business', 'Luxury', 'Backpacking'];
const TRAVELER_OPTIONS = ['1 Traveler', '2 Travelers', '3 Travelers', '4 Travelers', '5 Travelers', '6+ Travelers'];
const CATEGORIES = [
  { name: 'Popular', icon: Sparkles, query: 'interesting_places' },
  { name: 'Beaches', icon: Palmtree, query: 'beaches,natural' },
  { name: 'Mountains', icon: Mountain, query: 'mountains,natural' },
  { name: 'Heritage', icon: Landmark, query: 'historic,cultural' },
  { name: 'Adventure', icon: Compass, query: 'sport,amusements' },
  { name: 'Food & Culture', icon: UtensilsCrossed, query: 'foods,shops' },
];

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    destination: '',
    tripType: 'Leisure',
    travelers: '1 Traveler',
    description: '',
  });

  // Destination search
  const [destQuery, setDestQuery] = useState('');
  const [destResults, setDestResults] = useState([]);
  const [destLoading, setDestLoading] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);
  const destRef = useRef(null);
  const searchTimeout = useRef(null);

  // Suggestions
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Load suggestions when category or destination changes
  useEffect(() => {
    loadSuggestions(activeCategory);
  }, [activeCategory, selectedDest]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadSuggestions = async (category) => {
    setSuggestionsLoading(true);
    try {
      const destination = selectedDest?.name || destQuery;
      if (destination && destination.length >= 2) {
        // Fetch place-specific attractions via OpenTripMap API
        const catObj = CATEGORIES.find(c => c.name === category);
        const kinds = catObj?.query || 'interesting_places';
        const { data } = await placesAPI.search(destination, { kinds, limit: 8 });
        
        if (data.success && data.results) {
          const initialMap = data.results.map(r => ({
            name: r.name,
            country: destination,
            rating: (r.rate * 1.6 + 0.2).toFixed(1), // OTM rate 1-3 to 1-5 scale
            tags: [r.kinds ? r.kinds.split(',')[0].replace(/_/g, ' ') : category],
            image: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80`,
            xid: r.xid
          }));
          setSuggestions(initialMap);

          // Background fetch to get images
          const xids = data.results.map(r => r.xid).filter(Boolean);
          if (xids.length > 0) {
            placesAPI.batchDetails(xids).then(res => {
              if (res.data.success) {
                const imgMap = {};
                res.data.results.forEach(d => { if(d.image) imgMap[d.xid] = d.image; });
                setSuggestions(prev => prev.map(p => imgMap[p.xid] ? { ...p, image: imgMap[p.xid] } : p));
              }
            }).catch(e => console.warn('Background image fetch failed', e));
          }
        }
      } else {
        // No destination selected — show curated suggestions
        const { data } = await placesAPI.suggestions(category);
        if (data.success) setSuggestions(data.results);
      }
    } catch (err) {
      console.error('Suggestions error:', err);
      try {
        const { data } = await placesAPI.suggestions(activeCategory);
        if (data.success) setSuggestions(data.results);
      } catch (e) { /* ignore */ }
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleDestSearch = (value) => {
    setDestQuery(value);
    setFormData({ ...formData, destination: value });
    setSelectedDest(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 2) {
      setDestResults([]);
      setShowDestDropdown(false);
      return;
    }

    setDestLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await placesAPI.autosuggest(value, { limit: 5 });
        if (data.success) {
          setDestResults(data.results.map(r => ({
            name: r.name,
            address: r.kinds ? r.kinds.split(',')[0].replace(/_/g, ' ') : '',
            rating: r.rate > 0 ? (r.rate * 1.6 + 0.2).toFixed(1) : 0
          })));
          setShowDestDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setDestLoading(false);
      }
    }, 400);
  };

  const selectDestination = (place) => {
    setSelectedDest(place);
    setDestQuery(place.name);
    setFormData({ ...formData, destination: place.name });
    setShowDestDropdown(false);
  };

  const toggleFavorite = (name) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Trip name is required'); return; }
    if (!formData.startDate) { setError('Start date is required'); return; }
    if (!formData.endDate) { setError('End date is required'); return; }
    if (new Date(formData.endDate) < new Date(formData.startDate)) { setError('End date must be after start date'); return; }

    setLoading(true);
    setError('');
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        destinations: formData.destination ? [{ name: formData.destination, country: selectedDest?.address?.split(',').pop()?.trim() || '' }] : [],
        tripType: formData.tripType,
        travelerCount: parseInt(formData.travelers) || 1,
        tags: [formData.tripType],
        budget: { total: 0, currency: 'INR' },
        status: 'draft',
      };
      const { data } = await tripAPI.create(payload);
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate(`/dashboard/itinerary?trip=${data.trip._id}`), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  // ===== SUCCESS STATE =====
  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Trip Created!</h2>
          <p className="text-slate-500">Redirecting to build your itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
        <Link to="/dashboard/trips" className="hover:text-primary-600 transition-colors">← My Trips</Link>
      </div>

      {/* Header + Banner */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Create a New Trip</h1>
          <p className="text-slate-500 mt-1">Let's start planning your next adventure</p>
        </div>
        {/* Decorative travel illustration */}
        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&q=80"
            alt=""
            className="w-28 h-20 rounded-2xl object-cover opacity-80"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* ===== TRIP DETAILS FORM ===== */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-8">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary-600" /> Trip Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Trip Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trip Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a trip name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all pr-10"
                />
                <Plane className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            {/* Destination Search */}
            <div ref={destRef} className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select a Place / Destination</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={destQuery}
                  onChange={(e) => handleDestSearch(e.target.value)}
                  onFocus={() => destResults.length > 0 && setShowDestDropdown(true)}
                  placeholder="Search for a city or country"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
                {destLoading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />}
                {!destLoading && destQuery && (
                  <button type="button" onClick={() => { setDestQuery(''); setSelectedDest(null); setFormData({...formData, destination: ''}); }} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDestDropdown && destResults.length > 0 && (
                <div className="absolute z-30 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto animate-fade-in">
                  {destResults.map((place, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectDestination(place)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left"
                    >
                      <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{place.name}</p>
                        <p className="text-xs text-slate-400 truncate">{place.address}</p>
                      </div>
                      {place.rating > 0 && (
                        <span className="ml-auto text-xs text-amber-600 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {place.rating}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Trip Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trip Type <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all appearance-none cursor-pointer"
                >
                  {TRIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Travelers</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="travelers"
                  value={formData.travelers}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all appearance-none cursor-pointer"
                >
                  {TRAVELER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trip Description <span className="text-slate-400 font-normal">(Optional)</span></label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your trip, interests, plans or anything you'd like to remember..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
              />
              <span className="absolute bottom-2.5 right-3.5 text-xs text-slate-400">{formData.description.length}/500</span>
            </div>
          </div>
        </div>

        {/* ===== PLACE SUGGESTIONS ===== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              {selectedDest ? (
                <>Suggestions for <span className="text-primary-600">{selectedDest.name}</span></>
              ) : (
                'Suggestions for Places to Visit / Activities to Perform'
              )}
            </h3>
            <button type="button" className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1 transition-colors">
              View all →
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.name
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" /> {cat.name}
              </button>
            ))}
          </div>

          {/* Suggestion Cards Grid */}
          {suggestionsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-xl aspect-[4/3]" />
                  <div className="mt-2 h-4 bg-slate-200 rounded w-3/4" />
                  <div className="mt-1 h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestions.map((place, i) => (
                <div key={i} className="group cursor-pointer" onClick={() => {
                  setDestQuery(place.name);
                  setFormData({ ...formData, destination: place.name });
                  setSelectedDest(place);
                }}>
                  {/* Image */}
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                    <img
                      src={place.image || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80`}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {/* Favorite */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(place.name); }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(place.name) ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                    </button>
                  </div>
                  {/* Info */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{place.name}</h4>
                      {place.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {place.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{place.country}</p>
                    {place.tags && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {place.tags.join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== BOTTOM ACTIONS ===== */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link to="/dashboard/trips" className="px-6 py-3 text-slate-600 font-medium text-sm hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plane className="w-4 h-4" />}
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;
