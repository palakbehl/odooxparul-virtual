// ==========================================
// Checklist Page - Traveloop
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import {
  CheckSquare, Square, Plus, Trash2, Loader2,
  Luggage, Shirt, Pill, Camera, FileText, ChevronDown
} from 'lucide-react';

const categoryConfig = {
  general: { label: 'General', icon: FileText, color: 'text-slate-500' },
  clothing: { label: 'Clothing', icon: Shirt, color: 'text-blue-500' },
  toiletries: { label: 'Toiletries', icon: Pill, color: 'text-emerald-500' },
  electronics: { label: 'Electronics', icon: Camera, color: 'text-purple-500' },
  documents: { label: 'Documents', icon: FileText, color: 'text-amber-500' },
};

const Checklist = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('general');

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
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const dummyTrips = [
    {
      _id: 'dummy1',
      title: 'Europe Getaway',
      checklist: [
        { item: 'Passport', checked: true, category: 'documents' },
        { item: 'Flight Tickets', checked: true, category: 'documents' },
        { item: 'T-shirts (x5)', checked: false, category: 'clothing' },
        { item: 'Toothbrush', checked: false, category: 'toiletries' },
        { item: 'Camera', checked: true, category: 'electronics' },
        { item: 'Power adapter', checked: false, category: 'electronics' },
      ]
    },
    {
      _id: 'dummy2',
      title: 'Maldives Escape',
      checklist: [
        { item: 'Swimwear', checked: true, category: 'clothing' },
        { item: 'Sunscreen', checked: false, category: 'toiletries' },
      ]
    }
  ];

  const displayTrips = trips.length > 0 ? trips : dummyTrips;
  const currentTrip = selectedTrip || displayTrips[0];

  const toggleItem = async (index) => {
    if (!selectedTrip) return;
    const updatedChecklist = [...(selectedTrip.checklist || [])];
    updatedChecklist[index] = { ...updatedChecklist[index], checked: !updatedChecklist[index].checked };
    try {
      await tripAPI.update(selectedTrip._id, { checklist: updatedChecklist });
      setSelectedTrip({ ...selectedTrip, checklist: updatedChecklist });
      setTrips(trips.map(t => t._id === selectedTrip._id ? { ...t, checklist: updatedChecklist } : t));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const addItem = async () => {
    if (!newItem.trim() || !selectedTrip) return;
    const updatedChecklist = [...(selectedTrip.checklist || []), { item: newItem.trim(), checked: false, category: newCategory }];
    try {
      await tripAPI.update(selectedTrip._id, { checklist: updatedChecklist });
      setSelectedTrip({ ...selectedTrip, checklist: updatedChecklist });
      setTrips(trips.map(t => t._id === selectedTrip._id ? { ...t, checklist: updatedChecklist } : t));
      setNewItem('');
    } catch (err) {
      console.error('Add error:', err);
    }
  };

  const removeItem = async (index) => {
    if (!selectedTrip) return;
    const updatedChecklist = selectedTrip.checklist.filter((_, i) => i !== index);
    try {
      await tripAPI.update(selectedTrip._id, { checklist: updatedChecklist });
      setSelectedTrip({ ...selectedTrip, checklist: updatedChecklist });
      setTrips(trips.map(t => t._id === selectedTrip._id ? { ...t, checklist: updatedChecklist } : t));
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  const checklist = currentTrip?.checklist || [];
  const checkedCount = checklist.filter(c => c.checked).length;
  const progress = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

  // Group by category
  const grouped = checklist.reduce((acc, item, i) => {
    const cat = item.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...item, originalIndex: i });
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Checklist</h1>
        <p className="text-slate-500 text-sm mt-1">Never forget to pack anything</p>
      </div>

      {displayTrips.length > 0 ? (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Trip Selector */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Trip</h3>
              <div className="space-y-2">
                {displayTrips.map(trip => (
                  <button
                    key={trip._id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      currentTrip?._id === trip._id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${currentTrip?._id === trip._id ? 'text-primary-700' : 'text-slate-700'}`}>{trip.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{(trip.checklist || []).length} items</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {currentTrip && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Progress</h3>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient)" strokeWidth="8"
                        strokeDasharray={`${progress * 2.64} ${264 - progress * 2.64}`} strokeLinecap="round" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-900">{progress}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{checkedCount} of {checklist.length} packed</p>
                </div>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {currentTrip ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-900">{currentTrip.title} — Packing List</h2>
                </div>

                {/* Add Item */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    placeholder="Add new item..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 transition-all"
                  >
                    {Object.entries(categoryConfig).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={addItem}
                    className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Items by Category */}
                {Object.keys(grouped).length > 0 ? (
                  <div className="space-y-5">
                    {Object.entries(grouped).map(([cat, items]) => {
                      const config = categoryConfig[cat] || categoryConfig.general;
                      const CatIcon = config.icon;
                      return (
                        <div key={cat}>
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                            <CatIcon className={`w-4 h-4 ${config.color}`} />
                            {config.label}
                          </h4>
                          <div className="space-y-1">
                            {items.map((item) => (
                              <div
                                key={item.originalIndex}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                              >
                                <button onClick={() => toggleItem(item.originalIndex)}>
                                  {item.checked ? (
                                    <CheckSquare className="w-5 h-5 text-primary-600" />
                                  ) : (
                                    <Square className="w-5 h-5 text-slate-300" />
                                  )}
                                </button>
                                <span className={`flex-1 text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                  {item.item}
                                </span>
                                <button
                                  onClick={() => removeItem(item.originalIndex)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Luggage className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Empty checklist</h3>
                    <p className="text-sm text-slate-500">Add items to start packing</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-500">Select a trip</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No checklists</h3>
          <p className="text-slate-500 mb-6">Create a trip to start packing</p>
          <Link to="/dashboard/trips/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm">
            <Plus className="w-4 h-4" /> Create Trip
          </Link>
        </div>
      )}
    </div>
  );
};

export default Checklist;
