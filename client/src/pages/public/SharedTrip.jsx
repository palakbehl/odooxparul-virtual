import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sharedTripAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Globe, Calendar, MapPin, Users, Heart, Bookmark, Share2, Copy,
  Loader2, ArrowLeft, Clock, Compass, Utensils, Hotel, Bus, ShoppingBag,
  Facebook, Twitter, Linkedin, Link as LinkIcon, Eye
} from 'lucide-react';

const CAT_COLORS = { activity: 'bg-blue-500', food: 'bg-red-500', stay: 'bg-green-500', transfer: 'bg-amber-500', shopping: 'bg-purple-500', other: 'bg-slate-400' };
const CAT_ICONS = { activity: Compass, food: Utensils, stay: Hotel, transfer: Bus, shopping: ShoppingBag, other: MapPin };

const SimpleDonutChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div className="w-32 h-32 rounded-full border-4 border-slate-100 flex items-center justify-center text-xs text-slate-400">No Data</div>;

  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <svg viewBox="-1 -1 2 2" className="w-32 h-32 transform -rotate-90">
      {data.map((slice, i) => {
        const startPercent = cumulativePercent;
        const slicePercent = slice.value / total;
        cumulativePercent += slicePercent;
        
        const [startX, startY] = getCoordinatesForPercent(startPercent);
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
        const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
        
        const pathData = [
          `M ${startX} ${startY}`,
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `L 0 0`,
        ].join(' ');

        return (
          <path 
            key={i} d={pathData} fill={slice.color} 
            className="hover:opacity-80 transition-opacity cursor-pointer stroke-white stroke-[0.05]" 
          />
        );
      })}
      {/* Inner circle for Donut effect */}
      <circle cx="0" cy="0" r="0.65" fill="white" />
    </svg>
  );
};

const SharedTrip = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(0);
  const [isCopying, setIsCopying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        setLoading(true);
        // Record View
        await sharedTripAPI.view(shareId).catch(() => {});
        
        const res = await sharedTripAPI.get(shareId);
        if (res.data.success) {
          setTrip(res.data.trip);
          setItinerary(res.data.itinerarySections || []);
          setIsLiked(res.data.isLiked);
          setIsSaved(res.data.isSaved);
          setLikesCount(res.data.trip.likes || 0);
          setSavesCount(res.data.trip.saves || 0);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shared itinerary.');
      } finally {
        setLoading(false);
      }
    };
    loadTrip();
  }, [shareId]);

  const handleCopy = async () => {
    if (!user) {
      alert("Please login to copy this itinerary to your account.");
      navigate('/login', { state: { returnTo: `/shared-trip/${shareId}` } });
      return;
    }
    
    try {
      setIsCopying(true);
      const res = await sharedTripAPI.copy(shareId);
      if (res.data.success) {
        alert("Itinerary copied successfully!");
        navigate(`/dashboard/trips/${res.data.tripId}`);
      }
    } catch (err) {
      alert("Failed to copy itinerary.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleLike = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await sharedTripAPI.like(shareId);
      if (res.data.success) {
        setIsLiked(res.data.liked);
        setLikesCount(res.data.likes);
      }
    } catch (e) {}
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await sharedTripAPI.save(shareId);
      if (res.data.success) {
        setIsSaved(res.data.saved);
        setSavesCount(res.data.saves);
      }
    } catch (e) {}
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    setShowShareMenu(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-primary-600 animate-spin" /></div>;
  
  if (error || !trip) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe className="w-10 h-10 text-red-500 opacity-50" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Trip Unavailable</h1>
        <p className="text-slate-500 mb-8">{error}</p>
        <Link to="/" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors inline-block">Return Home</Link>
      </div>
    </div>
  );

  // Budget calculations
  let totalCost = 0;
  let categoryCosts = { activity: 0, food: 0, stay: 0, transfer: 0, shopping: 0, other: 0 };
  
  itinerary.forEach(day => {
    (day.activities || []).forEach(act => {
      const cost = Number(act.cost) || 0;
      totalCost += cost;
      if (categoryCosts[act.category] !== undefined) categoryCosts[act.category] += cost;
      else categoryCosts.other += cost;
    });
  });

  const budgetData = Object.keys(categoryCosts)
    .filter(k => categoryCosts[k] > 0)
    .map(k => ({
      name: k,
      value: categoryCosts[k],
      color: k === 'activity' ? '#3B82F6' : k === 'food' ? '#EF4444' : k === 'stay' ? '#10B981' : k === 'transfer' ? '#F59E0B' : k === 'shopping' ? '#8B5CF6' : '#94A3B8'
    }));

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  const fmtDay = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short' }) : '';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* Navbar Minimal */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-slate-900">Traveloop</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-primary-600">Dashboard</Link>
            ) : (
              <Link to="/login" className="px-5 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors">Log in</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back button (optional if coming from community) */}
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* HERO SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8 animate-fade-in">
          <div className="h-64 sm:h-80 relative overflow-hidden">
            <img src={trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80'} alt="Trip Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
            
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-white/30">
                <Globe className="w-3.5 h-3.5" /> Public Itinerary
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-3">{trip.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {trip.duration || 1} Days</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {trip.destinations?.length || 0} Cities</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {trip.travelerCount || 1} Travelers</span>
                <span className="flex items-center gap-1.5 ml-auto"><Eye className="w-4 h-4" /> {trip.publicViews || 0} Views</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <img src={trip.user?.profileImage || `https://ui-avatars.com/api/?name=${trip.user?.firstName}+${trip.user?.lastName}&background=EFF6FF&color=1D4ED8`} alt="Creator" className="w-14 h-14 rounded-full border-2 border-white shadow-md" />
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Created by</p>
                <p className="text-lg font-bold text-slate-900">{trip.user?.firstName} {trip.user?.lastName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={handleLike} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border ${isLiked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} /> {likesCount}
              </button>
              
              <button onClick={handleSave} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border ${isSaved ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} /> {savesCount}
              </button>

              <div className="relative flex-1 md:flex-none">
                <button onClick={() => setShowShareMenu(!showShareMenu)} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden py-1">
                    <button onClick={copyLink} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700"><LinkIcon className="w-4 h-4 text-slate-400" /> Copy Link</button>
                    <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=Check out this awesome trip itinerary!`} target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700"><Twitter className="w-4 h-4 text-blue-400" /> Twitter</a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700"><Facebook className="w-4 h-4 text-blue-600" /> Facebook</a>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700"><Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn</a>
                  </div>
                )}
              </div>

              <button onClick={handleCopy} disabled={isCopying} className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary-700 hover:shadow-lg transition-all disabled:opacity-70">
                {isCopying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Copy Trip
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Overview</h3>
            <p className="text-slate-600 leading-relaxed">{trip.description || 'No description provided by the creator.'}</p>
            
            {trip.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {trip.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg uppercase tracking-wider border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: ITINERARY TIMELINE */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* DESTINATIONS OVERVIEW */}
            {trip.destinations?.length > 0 && (
              <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-500" /> Destinations</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {trip.destinations.map((dest, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-lg">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight">{dest.name}</h4>
                        {dest.country && <p className="text-xs text-slate-500 mt-0.5">{dest.country}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DAY-WISE ITINERARY (REUSED UI) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary-500" /> Day-by-Day Plan</h3>
              
              <div className="space-y-0">
                {itinerary.length === 0 ? (
                  <p className="text-slate-500 text-center py-10">No detailed itinerary sections have been added yet.</p>
                ) : (
                  itinerary.map((day, di) => (
                    <div key={day._id || di} className="relative">
                      {/* Day Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-primary-600 rounded-full ring-4 ring-primary-100"/>
                          {di < itinerary.length - 1 && <div className="w-0.5 bg-primary-100 flex-1 min-h-[20px]"/>}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Day {day.dayNumber || di + 1} {day.cityName ? `- ${day.cityName}` : ''}</h3>
                          {day.date && <p className="text-xs text-slate-400">{fmt(day.date)} · {fmtDay(day.date)}</p>}
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="ml-5 pl-5 border-l-2 border-primary-100 space-y-4 pb-8">
                        {(day.activities || []).map((act, ai) => {
                          const CatIcon = CAT_ICONS[act.category] || MapPin;
                          return (
                            <div key={ai} className="flex items-start gap-4 bg-slate-50 rounded-2xl border border-slate-100 p-4 transition-all hover:bg-white hover:shadow-md">
                              <div className={`w-10 h-10 ${CAT_COLORS[act.category]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                <CatIcon className="w-5 h-5 text-white"/>
                              </div>
                              {act.image && <img src={act.image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0 hidden sm:block shadow-sm"/>}
                              <div className="flex-1 min-w-0">
                                {(act.startTime || act.endTime) && <p className="text-xs font-bold text-primary-600 mb-1 tracking-wide">{act.startTime}{act.endTime ? ` – ${act.endTime}` : ''}</p>}
                                <h4 className="text-base font-bold text-slate-900">{act.title}</h4>
                                {act.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{act.description}</p>}
                                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs font-medium text-slate-500">
                                  {act.duration && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/>{act.duration}</span>}
                                  {act.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/>{act.location}</span>}
                                </div>
                              </div>
                              {act.cost > 0 && (
                                <div className="text-right flex-shrink-0 ml-2">
                                  <p className="text-sm font-bold text-emerald-600">₹ {(act.cost || 0).toLocaleString()}</p>
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{act.costType === 'free' ? 'Free' : act.costType === 'per_person' ? 'Per Person' : 'Total'}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(!day.activities || day.activities.length === 0) && <p className="text-sm text-slate-400 italic py-2">Relaxation day - no planned activities.</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COL: BUDGET & INFO */}
          <div className="space-y-8">
            
            {/* BUDGET SUMMARY CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Utensils className="w-5 h-5 text-emerald-500" /> Budget Summary</h3>
              
              {totalCost > 0 ? (
                <>
                  <div className="flex items-center justify-center mb-8">
                    <SimpleDonutChart data={budgetData} />
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Total Estimated Cost</p>
                    <p className="text-3xl font-bold text-emerald-600">₹ {totalCost.toLocaleString()}</p>
                  </div>

                  <div className="space-y-3">
                    {budgetData.map((b, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }}></span>
                          <span className="text-sm font-semibold text-slate-700 capitalize">{b.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">₹ {b.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Utensils className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500">No budget details provided.</p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button onClick={handleCopy} disabled={isCopying} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-md hover:bg-primary-700 transition-all disabled:opacity-70">
                  {isCopying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
                  Copy this Itinerary
                </button>
                <p className="text-xs text-center text-slate-500 mt-3">Duplicate into your account to customize and edit.</p>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};

export default SharedTrip;
