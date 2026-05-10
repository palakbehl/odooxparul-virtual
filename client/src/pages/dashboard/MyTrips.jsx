// ==========================================
// My Trips Page - Traveloop
// Redesigned to match reference image exactly
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import {
  Plus, Search, Filter, MapPin, Calendar, CheckCircle,
  FileEdit, MoreVertical, ChevronRight, LayoutGrid, ArrowDownUp,
  ArrowRight, Plane
} from 'lucide-react';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data } = await tripAPI.getAll();
      if (data.success) setTrips(data.trips);
    } catch (err) {
      console.error('Load trips error:', err);
    } finally {
      setLoading(false);
    }
  };

  const dummyTrips = [
    {
      _id: 'dummy1',
      title: 'Greek Island Escape',
      status: 'active',
      startDate: '2025-05-10T00:00:00Z',
      endDate: '2025-05-17T00:00:00Z',
      destinations: [{ name: 'Santorini', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=150&q=80' }, { name: 'Mykonos', image: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=150&q=80' }, { name: 'Athens', image: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?w=150&q=80' }],
      destinationsCount: 3,
      travelers: [{ user: { firstName: 'P', lastName: 'K', avatar: 'https://i.pravatar.cc/150?img=11' } }, { user: { firstName: 'A', lastName: 'S', avatar: 'https://i.pravatar.cc/150?img=5' } }],
      travelersCount: 3,
      coverImage: 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=800&q=80',
    },
    {
      _id: 'dummy2',
      title: 'Europe Getaway',
      status: 'upcoming',
      startDate: '2025-05-24T00:00:00Z',
      endDate: '2025-06-05T00:00:00Z',
      destinations: [{ image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=150&q=80' }, { image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=150&q=80' }, { image: 'https://images.unsplash.com/photo-1515542622106-78b28af7815b?w=150&q=80' }],
      destinationsCount: 5,
      travelers: [{ user: { avatar: 'https://i.pravatar.cc/150?img=1' } }, { user: { avatar: 'https://i.pravatar.cc/150?img=2' } }],
      travelersCount: 5,
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    },
    {
      _id: 'dummy3',
      title: 'Maldives Escape',
      status: 'completed',
      startDate: '2025-03-05T00:00:00Z',
      endDate: '2025-03-12T00:00:00Z',
      destinations: [{ image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=150&q=80' }],
      destinationsCount: 1,
      travelers: [],
      travelersCount: 0,
      coverImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    },
    {
      _id: 'dummy4',
      title: 'New Zealand Road Trip',
      status: 'draft',
      startDate: null,
      endDate: null,
      destinations: [{ image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=150&q=80' }, { image: 'https://images.unsplash.com/photo-1469521669194-babbdf9ff9cb?w=150&q=80' }, { image: 'https://images.unsplash.com/photo-1506461883276-594a12b11dc3?w=150&q=80' }],
      destinationsCount: 6,
      travelers: [],
      travelersCount: 0,
      coverImage: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80',
    }
  ];

  const displayTrips = trips.length > 0 ? trips : dummyTrips;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredTrips = displayTrips.filter(t =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTrips = {
    active: filteredTrips.filter(t => t.status === 'active'),
    upcoming: filteredTrips.filter(t => t.status === 'upcoming'),
    completed: filteredTrips.filter(t => t.status === 'completed'),
    draft: filteredTrips.filter(t => t.status === 'draft'),
  };

  const groupConfig = {
    active: { title: 'Ongoing', icon: Plane, iconBg: 'bg-emerald-500', iconColor: 'text-white', textColor: 'text-emerald-600', pillBg: 'bg-emerald-100', btnText: 'text-emerald-600', btnBg: 'hover:bg-emerald-50 border-emerald-200' },
    upcoming: { title: 'Upcoming', icon: Calendar, iconBg: 'bg-primary-600', iconColor: 'text-white', textColor: 'text-primary-700', pillBg: 'bg-primary-100', btnText: 'text-primary-600', btnBg: 'hover:bg-primary-50 border-primary-200' },
    completed: { title: 'Completed', icon: CheckCircle, iconBg: 'bg-emerald-500', iconColor: 'text-white', textColor: 'text-emerald-700', pillBg: 'bg-emerald-100', btnText: 'text-emerald-600', btnBg: 'hover:bg-emerald-50 border-emerald-200' },
    draft: { title: 'Drafts', icon: FileEdit, iconBg: 'bg-purple-500', iconColor: 'text-white', textColor: 'text-purple-700', pillBg: 'bg-purple-100', btnText: 'text-purple-600', btnBg: 'hover:bg-purple-50 border-purple-200' },
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold font-display text-slate-900 leading-tight">My Trips</h1>
          <p className="text-slate-500 text-sm mt-1">All your adventures, organized in one place.</p>
        </div>
        <Link
          to="/dashboard/trips/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm shadow-md shadow-primary-600/20 hover:bg-primary-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Plan a New Trip
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 border border-slate-200 rounded-2xl">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips..."
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm placeholder-slate-400 focus:outline-none focus:ring-0 border-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            <LayoutGrid className="w-4 h-4 text-slate-500" />
            Group by
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90 ml-1" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            Sort by
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90 ml-1" />
          </button>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-10">
        {['active', 'upcoming', 'completed', 'draft'].map((statusKey) => {
          const groupItems = groupedTrips[statusKey];
          if (!groupItems || groupItems.length === 0) return null;

          const config = groupConfig[statusKey];
          const GroupIcon = config.icon;

          return (
            <section key={statusKey} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.iconBg}`}>
                    <GroupIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                  </div>
                  <h2 className={`text-base font-bold ${config.textColor}`}>{config.title}</h2>
                </div>
                <button className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
                  View all <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {groupItems.map((trip) => {
                  const isOngoing = trip.status === 'active';
                  const isUpcoming = trip.status === 'upcoming';
                  const isCompleted = trip.status === 'completed';
                  const isDraft = trip.status === 'draft';

                  return (
                    <div key={trip._id} className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-3xl p-4 gap-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Left: Image */}
                      <div className="relative w-full md:w-[320px] h-[200px] rounded-2xl overflow-hidden shrink-0">
                        <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        <div className={`absolute top-4 left-4 px-3 py-1.5 ${config.pillBg} rounded-full`}>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${config.textColor}`}>{trip.status === 'active' ? 'ONGOING' : trip.status}</span>
                        </div>
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1 flex flex-col justify-between py-1 px-2 md:px-0">
                        {/* Top Row */}
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{trip.title}</h3>
                            <button className="text-slate-400 hover:text-slate-600 p-1">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium mb-4">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {trip.startDate ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}` : 'No dates set'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {trip.destinationsCount || trip.destinations?.length || 0} Destinations</span>
                          </div>

                          {/* Destination Images */}
                          {trip.destinations && trip.destinations.length > 0 && (
                            <div className="flex items-center gap-1.5 mb-5">
                              {trip.destinations.slice(0, 3).map((d, i) => (
                                <img key={i} src={d.image || d.coverImage || 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=150&q=80'} alt="destination" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                              ))}
                              {(trip.destinationsCount || trip.destinations.length) > 3 && (
                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border-2 border-white shadow-sm">
                                  +{(trip.destinationsCount || trip.destinations.length) - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Middle Row (Status specific info) */}
                        <div className="mb-4 mt-auto">
                          {isOngoing && (
                            <div className="max-w-md">
                              <div className="flex justify-between text-[13px] text-slate-600 mb-2 font-medium">
                                <span>Day 3 of 8</span>
                                <span>37%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full w-[37%]" />
                              </div>
                            </div>
                          )}
                          {isUpcoming && (
                            <p className="text-[13px] text-slate-600 font-medium">Starts in <span className="text-primary-600 font-bold">12 days</span></p>
                          )}
                          {isCompleted && (
                            <p className="text-[13px] text-slate-500">Trip completed on {formatDate(trip.endDate)}</p>
                          )}
                          {isDraft && (
                            <p className="text-[13px] text-slate-500">Updated 2 days ago</p>
                          )}
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                          <div className="flex items-center">
                            {trip.travelers?.length > 0 ? (
                              <>
                                {trip.travelers.slice(0, 2).map((t, i) => (
                                  <img key={i} src={t.user?.avatar || `https://i.pravatar.cc/150?img=${i + 10}`} alt="traveler" className={`w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm ${i > 0 ? '-ml-2' : ''}`} />
                                ))}
                                {trip.travelersCount > 2 && (
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border-2 border-white shadow-sm -ml-2">
                                    +{trip.travelersCount - 2}
                                  </div>
                                )}
                              </>
                            ) : <div className="w-8 h-8" />}
                          </div>
                          <Link
                            to={`/dashboard/trips/${trip._id}`}
                            className={`flex items-center gap-2 px-5 py-2.5 bg-white border rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md ${config.btnText} ${config.btnBg}`}
                          >
                            {isCompleted ? 'View Trip Summary' : isDraft ? 'Continue Planning' : 'View Trip'}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom CTA Banner */}
      <div className="mt-12 bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Plane className="w-6 h-6 text-primary-600 transform -rotate-45" />
          <div className="text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-900">Ready for your next adventure?</h3>
            <p className="text-sm text-slate-500">Start planning a new trip and make unforgettable memories.</p>
          </div>
        </div>
        <Link
          to="/dashboard/trips/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-primary-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Plan a New Trip
        </Link>
      </div>

    </div>
  );
};

export default MyTrips;
