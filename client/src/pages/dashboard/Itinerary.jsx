// ==========================================
// Itinerary Page - Traveloop
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import {
  CalendarDays, Plus, MapPin, Clock, CheckCircle, Circle,
  ChevronRight, Loader2, Sunrise
} from 'lucide-react';

const Itinerary = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data } = await tripAPI.getAll({ sort: '-startDate' });
      if (data.success && data.trips.length > 0) {
        setTrips(data.trips);
        setSelectedTrip(data.trips[0]);
      }
    } catch (err) {
      console.error('Load trips error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Itinerary</h1>
          <p className="text-slate-500 text-sm mt-1">Plan your day-by-day activities</p>
        </div>
        <Link
          to="/dashboard/trips/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </Link>
      </div>

      {trips.length > 0 ? (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Trip Selector */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm h-fit">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Trip</h3>
            <div className="space-y-2">
              {trips.map(trip => (
                <button
                  key={trip._id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedTrip?._id === trip._id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <p className={`text-sm font-semibold ${selectedTrip?._id === trip._id ? 'text-primary-700' : 'text-slate-700'}`}>{trip.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {trip.destinations?.map(d => d.name).join(', ') || 'No destinations'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Itinerary Timeline */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {selectedTrip ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedTrip.title}</h2>
                    <p className="text-sm text-slate-500">
                      {formatDate(selectedTrip.startDate)} → {formatDate(selectedTrip.endDate)}
                    </p>
                  </div>
                </div>

                {selectedTrip.itinerary?.length > 0 ? (
                  <div className="space-y-6">
                    {selectedTrip.itinerary.map((day) => (
                      <div key={day.day} className="relative pl-8 pb-6 border-l-2 border-primary-200 last:border-transparent">
                        <div className="absolute -left-3 top-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{day.day}</span>
                        </div>
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-slate-900">Day {day.day} {day.title && `- ${day.title}`}</h3>
                          {day.date && <p className="text-xs text-slate-400">{formatDate(day.date)}</p>}
                        </div>
                        <div className="space-y-2">
                          {day.activities?.map((act, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                              {act.completed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700">{act.title}</p>
                                {act.description && <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>}
                                <div className="flex items-center gap-3 mt-1.5">
                                  {act.time && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <Clock className="w-3 h-3" />{act.time}
                                    </span>
                                  )}
                                  {act.location && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <MapPin className="w-3 h-3" />{act.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!day.activities || day.activities.length === 0) && (
                            <p className="text-sm text-slate-400 italic">No activities planned yet</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sunrise className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No itinerary yet</h3>
                    <p className="text-sm text-slate-500 mb-4">Start adding day-by-day plans for this trip</p>
                    <p className="text-xs text-slate-400">Tip: You can add itinerary items when editing a trip</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-500">Select a trip to view its itinerary</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No itineraries</h3>
          <p className="text-slate-500 mb-6">Create a trip to start building your itinerary</p>
          <Link to="/dashboard/trips/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm">
            <Plus className="w-4 h-4" /> Create Trip
          </Link>
        </div>
      )}
    </div>
  );
};

export default Itinerary;
