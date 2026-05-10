// ==========================================
// Discover Page - Traveloop
// Powered by OpenTripMap API
// Fully Dynamic with search → geoname → radius → batch details pipeline
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { placesAPI } from '../../services/api';
import {
  Search, Star, MapPin, Clock, SlidersHorizontal,
  ChevronDown, X, Heart, Flame, TrendingUp, ChevronLeft, ChevronRight,
  LayoutGrid, Loader2, Globe
} from 'lucide-react';

// OpenTripMap kind categories for the filters
const KIND_CATEGORIES = [
  { key: 'interesting_places', label: 'All Categories' },
  { key: 'cultural', label: 'Cultural' },
  { key: 'historic', label: 'Historic' },
  { key: 'natural', label: 'Nature' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'religion', label: 'Religious' },
  { key: 'sport', label: 'Sports' },
  { key: 'amusements', label: 'Amusements' },
  { key: 'shops', label: 'Shopping' },
  { key: 'foods', label: 'Food & Drink' },
];

const Discover = () => {
  const [searchParams] = useSearchParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || 'Paris');
  const [locationInfo, setLocationInfo] = useState(null);
  const [selectedKind, setSelectedKind] = useState('interesting_places');
  const [searchRadius, setSearchRadius] = useState(10000);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Autosuggest State
  const [destResults, setDestResults] = useState([]);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [destLoading, setDestLoading] = useState(false);
  const searchTimeout = useRef(null);
  const destRef = useRef(null);

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

  const handleDestSearch = (val) => {
    setSearchQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length < 2) {
      setDestResults([]);
      setShowDestDropdown(false);
      return;
    }
    setDestLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await placesAPI.autosuggest(val, { limit: 5 });
        if (data.success) {
          setDestResults(data.results.map(r => ({
            name: r.name,
            country: r.kinds ? r.kinds.split(',')[0].replace(/_/g, ' ') : ''
          })));
          setShowDestDropdown(true);
        }
      } catch (err) {} finally {
        setDestLoading(false);
      }
    }, 400);
  };

  // Debounced search
  useEffect(() => {
    loadActivities(searchQuery, selectedKind, searchRadius);
  }, []); // Only on mount

  const loadActivities = useCallback(async (query, kinds = 'interesting_places', radius = 10000) => {
    setLoading(true);
    try {
      const q = query || 'Paris';

      // Step 1: Use the combined search endpoint (geoname + radius)
      // Fetch more items to allow local pagination and sorting
      const { data } = await placesAPI.search(q, { kinds, radius, limit: 50 });

      if (data.success && data.results && data.results.length > 0) {
        setLocationInfo(data.location || null);
        setTotalResults(data.total || data.results.length);

        // Step 2: Get detailed info (images, descriptions) for the top results
        const xids = data.results.map(r => r.xid).filter(Boolean);
        setActivities(data.results); // Show basic results immediately
        setLoading(false);
        setCurrentPage(1); // Reset pagination on new search

        if (xids.length > 0) {
          setDetailsLoading(true);
          try {
            const detailsRes = await placesAPI.batchDetails(xids.slice(0, 10));
            if (detailsRes.data.success && detailsRes.data.results.length > 0) {
              // Merge details into results
              const detailMap = {};
              detailsRes.data.results.forEach(d => { detailMap[d.xid] = d; });

              setActivities(prev => prev.map(act => {
                const detail = detailMap[act.xid];
                if (detail) {
                  return {
                    ...act,
                    image: detail.image || '',
                    description: detail.description || '',
                    address: detail.address || {},
                    wikipedia: detail.wikipedia || ''
                  };
                }
                return act;
              }));
            }
          } catch (detailErr) {
            console.warn('Batch details enrichment failed:', detailErr.message);
          } finally {
            setDetailsLoading(false);
          }
        }
        return;
      }

      // If search returned nothing
      setActivities([]);
      setTotalResults(0);
      setLocationInfo(null);
    } catch (err) {
      console.error('Load activities error:', err);
      setActivities([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadActivities(searchQuery, selectedKind, searchRadius);
  };

  const handleKindChange = (kind) => {
    setSelectedKind(kind);
    loadActivities(searchQuery, kind, searchRadius);
  };

  // Format the OpenTripMap kinds string into a readable category
  const formatKinds = (kinds) => {
    if (!kinds) return 'Place';
    const first = kinds.split(',')[0];
    return first.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Get a badge based on the rate (OpenTripMap 1-3 scale, 3h being highest)
  const getBadge = (rate, index) => {
    if (rate >= 3) return { label: 'Top Rated', type: 'star' };
    if (rate >= 2 && index < 3) return { label: 'Popular', type: 'flame' };
    if (index % 4 === 3) return { label: 'Trending', type: 'trending' };
    return null;
  };

  // Format address object from OpenTripMap
  const formatAddress = (address, lat, lon) => {
    if (address && typeof address === 'object') {
      const parts = [address.road, address.city || address.town || address.village, address.state, address.country].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }
    if (locationInfo) return `${locationInfo.name}, ${locationInfo.country}`;
    return lat && lon ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : 'Unknown location';
  };

  // Sort and Paginate Activities
  const getSortedAndPaginatedActivities = () => {
    let sorted = [...activities];
    if (sortBy === 'distance') {
      sorted.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // recommended -> sort by rate descending
      sorted.sort((a, b) => b.rate - a.rate);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  };

  const displayedActivities = getSortedAndPaginatedActivities();
  const totalPages = Math.ceil(activities.length / itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
        <span className="hover:text-slate-700 cursor-pointer transition-colors">Discover</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-medium">Activities</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-[32px] font-bold font-display text-slate-900 leading-tight">Find Activities</h1>
        <p className="text-slate-500 mt-1">Search and discover amazing things to do</p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Top Row: Search and Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3">
          <div ref={destRef} className="relative flex-1">
            <form onSubmit={handleSearch} className="relative flex items-center border border-slate-200 rounded-xl bg-white px-3 py-2.5 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all shadow-sm">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleDestSearch(e.target.value)}
                onFocus={() => destResults.length > 0 && setShowDestDropdown(true)}
                placeholder="Search a city or place name..."
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-3 text-sm text-slate-700 placeholder-slate-400 w-full"
              />
              {destLoading && <Loader2 className="w-4 h-4 text-primary-500 animate-spin mr-2 shrink-0" />}
              {!destLoading && searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setShowDestDropdown(false); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            {showDestDropdown && destResults.length > 0 && (
              <div className="absolute z-50 top-full mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto animate-fade-in">
                {destResults.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSearchQuery(r.name);
                      setShowDestDropdown(false);
                      loadActivities(r.name, selectedKind, searchRadius);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left"
                  >
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                      <p className="text-xs text-slate-400 truncate">{r.country}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-sm">
              <LayoutGrid className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Group by</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-sm">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              Filter
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-sm"
              >
                Sort by
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1">
                  <button onClick={() => { setSortBy('recommended'); setShowSortDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${sortBy === 'recommended' ? 'text-primary-600 font-medium' : 'text-slate-700'}`}>Recommended</button>
                  <button onClick={() => { setSortBy('distance'); setShowSortDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${sortBy === 'distance' ? 'text-primary-600 font-medium' : 'text-slate-700'}`}>Distance</button>
                  <button onClick={() => { setSortBy('name'); setShowSortDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${sortBy === 'name' ? 'text-primary-600 font-medium' : 'text-slate-700'}`}>Name (A-Z)</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Category Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 mt-4">
          <div className="flex flex-wrap gap-2 mt-3">
            {/* City indicator */}
            {locationInfo && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700 font-medium">
                <MapPin className="w-4 h-4" />
                {locationInfo.name}, {locationInfo.country}
              </div>
            )}

            {/* Kind Category Selector */}
            <select
              value={selectedKind}
              onChange={(e) => handleKindChange(e.target.value)}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white cursor-pointer"
            >
              {KIND_CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>

            {/* Radius Selector */}
            <select
              value={searchRadius}
              onChange={(e) => {
                const r = parseInt(e.target.value);
                setSearchRadius(r);
                loadActivities(searchQuery, selectedKind, r);
              }}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white cursor-pointer"
            >
              <option value={5000}>Within 5 km</option>
              <option value={10000}>Within 10 km</option>
              <option value={20000}>Within 20 km</option>
              <option value={50000}>Within 50 km</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedKind('interesting_places');
              setSearchRadius(10000);
              loadActivities(searchQuery, 'interesting_places', 10000);
            }}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 px-2 mt-3 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 mb-5 gap-3">
        <h2 className="text-[15px] font-medium text-slate-700">
          Showing {displayedActivities.length} of {activities.length} results for <span className="font-bold text-slate-900">"{searchQuery || 'Paris'}"</span>
          {detailsLoading && <span className="ml-2 text-xs text-slate-400 animate-pulse">• Loading details...</span>}
        </h2>
        <div className="flex items-center gap-2 text-sm relative">
          <span className="text-slate-500">Sort by:</span>
          <button 
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            {sortBy === 'recommended' ? 'Recommended' : sortBy === 'distance' ? 'Distance' : 'Name (A-Z)'}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-sm text-slate-500">Searching places via OpenTripMap...</p>
        </div>
      ) : displayedActivities.length > 0 ? (
        <div className="space-y-5">
          {displayedActivities.map((act, index) => {
            const badge = getBadge(act.rate, index);
            const address = formatAddress(act.address, act.lat, act.lon);
            const category = formatKinds(act.kinds);
            const hasImage = act.image && act.image.length > 5;
            const placeholderImages = [
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
              'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
              'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=80',
            ];

            return (
              <div key={act.xid || index} className="flex flex-col sm:flex-row bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                {/* Image */}
                <div className="relative w-full sm:w-[300px] h-[220px] sm:h-auto shrink-0 group overflow-hidden">
                  <img
                    src={hasImage ? act.image : placeholderImages[index % placeholderImages.length]}
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.target.src = placeholderImages[index % placeholderImages.length]; }}
                  />
                  <button className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-[20px] font-bold text-slate-900 leading-tight pr-4">{act.name}</h3>
                    {badge && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                        badge.type === 'flame' ? 'bg-orange-100 text-orange-600' :
                        badge.type === 'star' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {badge.type === 'flame' && <Flame className="w-3.5 h-3.5" />}
                        {badge.type === 'star' && <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />}
                        {badge.type === 'trending' && <TrendingUp className="w-3.5 h-3.5" />}
                        {badge.label}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mb-3">
                    <MapPin className="w-4 h-4" />
                    {address}
                  </div>

                  {/* Star rating from OTM rate (1-3 scale mapped to 5-star) */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                    <span className="text-[15px] font-bold text-emerald-600">{(act.rate * 1.6 + 0.2).toFixed(1)}</span>
                    <span className="text-[13px] text-slate-500 font-medium">({category})</span>
                  </div>

                  {act.description && (
                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mb-6 flex-1 line-clamp-2">
                      {act.description}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                    <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
                      {act.distance > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {act.distance < 1000 ? `${act.distance} m away` : `${(act.distance / 1000).toFixed(1)} km away`}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        {category}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (act.xid) {
                          try {
                            const { data } = await placesAPI.details(act.xid);
                            if (data.result?.wikipedia) {
                              window.open(data.result.wikipedia, '_blank');
                            }
                          } catch {}
                        }
                      }}
                      className="px-6 py-2.5 border border-primary-200 text-primary-600 bg-white rounded-xl font-bold text-sm hover:bg-primary-50 hover:border-primary-300 transition-colors shadow-sm shrink-0"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No activities found</h3>
          <p className="text-slate-500">Try searching for a city name like "Paris", "Tokyo", or "Jaipur".</p>
        </div>
      )}

      {/* Pagination (Dynamic) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            // Simple pagination display logic (show first, last, and around current)
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              return (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === page 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">...</span>;
            }
            return null;
          })}

          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default Discover;
