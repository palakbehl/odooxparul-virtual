// ==========================================
// Checklist Page - Traveloop
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import {
  CheckSquare, Plus, Trash2, RotateCcw, Share2, ChevronUp, ChevronDown,
  FileText, Shirt, Smartphone, Heart, Briefcase, Loader2, X
} from 'lucide-react';

// Map icon keys to actual components (stored as strings in localStorage)
const ICON_MAP = { FileText, Shirt, Smartphone, Heart, Briefcase };

const DEFAULT_CATS = [
  {
    name: 'Documents', iconKey: 'FileText', color: 'bg-blue-500',
    items: ['Passport', 'Flight Tickets (printed)', 'Travel insurance', 'Hotel booking confirmation', 'Visa documents', 'ID cards']
  },
  {
    name: 'Clothing', iconKey: 'Shirt', color: 'bg-emerald-500',
    items: ['Casual Shirts', 'Trousers / jeans', 'Comfortable walking shoes', 'Light jacket / windbreaker', 'Swimwear', 'Sleepwear']
  },
  {
    name: 'Electronics', iconKey: 'Smartphone', color: 'bg-purple-500',
    items: ['Phone charger', 'Universal power adapter', 'Earphone / headphones', 'Camera', 'Portable battery']
  },
  {
    name: 'Medical', iconKey: 'Heart', color: 'bg-red-500',
    items: ['Personal medications', 'First-aid kit', 'Sunscreen', 'Hand sanitizer', 'Masks']
  },
  {
    name: 'Essentials', iconKey: 'Briefcase', color: 'bg-amber-500',
    items: ['Wallet / cash', 'Travel pillow', 'Water bottle', 'Snacks', 'Umbrella', 'Locks / padlocks']
  }
];

const Checklist = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addCat, setAddCat] = useState('');
  const [addItem, setAddItem] = useState('');
  const [copied, setCopied] = useState(false);

  // Load trips on mount
  useEffect(() => { loadTrips(); }, []);

  // When selected trip changes, load its checklist from localStorage or init defaults
  useEffect(() => {
    if (selectedTrip) {
      const key = `checklist_${selectedTrip._id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setCategories(JSON.parse(saved));
        } catch {
          initDefaults();
        }
      } else {
        initDefaults();
      }
    }
  }, [selectedTrip]);

  // Persist checklist to localStorage whenever it changes
  useEffect(() => {
    if (selectedTrip && categories.length > 0) {
      localStorage.setItem(`checklist_${selectedTrip._id}`, JSON.stringify(categories));
    }
  }, [categories, selectedTrip]);

  const initDefaults = () => {
    setCategories(DEFAULT_CATS.map(c => ({
      name: c.name,
      iconKey: c.iconKey,
      color: c.color,
      items: c.items.map(i => ({ name: i, packed: false }))
    })));
  };

  const loadTrips = async () => {
    try {
      const { data } = await tripAPI.getAll({});
      if (data.success && data.trips.length > 0) {
        setTrips(data.trips);
        setSelectedTrip(data.trips[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const togglePacked = (ci, ii) => {
    const cats = [...categories];
    cats[ci] = { ...cats[ci], items: [...cats[ci].items] };
    cats[ci].items[ii] = { ...cats[ci].items[ii], packed: !cats[ci].items[ii].packed };
    setCategories(cats);
  };

  const deleteItem = (ci, ii) => {
    const cats = [...categories];
    cats[ci] = { ...cats[ci], items: cats[ci].items.filter((_, idx) => idx !== ii) };
    setCategories(cats);
  };

  const resetAll = () => {
    setCategories(cs => cs.map(c => ({
      ...c,
      items: c.items.map(i => ({ ...i, packed: false }))
    })));
  };

  const handleAdd = () => {
    if (!addItem.trim()) return;
    const ci = categories.findIndex(c => c.name === addCat);
    if (ci > -1) {
      const cats = [...categories];
      cats[ci] = { ...cats[ci], items: [...cats[ci].items, { name: addItem.trim(), packed: false }] };
      setCategories(cats);
    } else {
      setCategories([...categories, {
        name: addCat || 'Custom',
        iconKey: 'Briefcase',
        color: 'bg-slate-500',
        items: [{ name: addItem.trim(), packed: false }]
      }]);
    }
    setAddItem('');
    setAddCat('');
    setShowAdd(false);
  };

  const shareChecklist = () => {
    const lines = [`🧳 Packing Checklist — ${selectedTrip?.title || 'Trip'}\n`];
    categories.forEach(cat => {
      lines.push(`\n📦 ${cat.name}`);
      cat.items.forEach(item => {
        lines.push(`  ${item.packed ? '✅' : '⬜'} ${item.name}`);
      });
    });
    lines.push(`\n---\nProgress: ${packedItems}/${totalItems} packed (${pct}%)`);
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const packedItems = categories.reduce((s, c) => s + c.items.filter(i => i.packed).length, 0);
  const pct = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  // Empty state — no trips at all
  if (!loading && trips.length === 0) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold font-display text-slate-900 mb-6">Packing Checklist</h1>
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No trips yet</h3>
          <p className="text-slate-500 mb-6">Create a trip to get your packing checklist started</p>
          <Link
            to="/dashboard/trips/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create Your First Trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Packing Checklist</h1>
          {selectedTrip && (
            <p className="text-slate-500 mt-1 text-sm">
              Trip: <span className="font-semibold text-slate-700">{selectedTrip.title}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset all
          </button>
          <button
            onClick={shareChecklist}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share Checklist'}
          </button>
        </div>
      </div>

      {/* Trip selector (when multiple trips) */}
      {trips.length > 1 && (
        <div className="mb-5">
          <select
            value={selectedTrip?._id || ''}
            onChange={e => setSelectedTrip(trips.find(t => t._id === e.target.value))}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
          >
            {trips.map(t => (
              <option key={t._id} value={t._id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_260px] gap-6">
        {/* ===== LEFT: Categories & Items ===== */}
        <div className="space-y-4">
          {categories.map((cat, ci) => {
            const CatIcon = ICON_MAP[cat.iconKey] || Briefcase;
            const catPacked = cat.items.filter(i => i.packed).length;
            const isOpen = !collapsed[ci];

            return (
              <div key={ci} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {/* Category Header */}
                <button
                  onClick={() => setCollapsed(prev => ({ ...prev, [ci]: isOpen }))}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${cat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <CatIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                      <p className="text-xs text-slate-400">{catPacked}/{cat.items.length} packed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {catPacked === cat.items.length && cat.items.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Done</span>
                    )}
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                </button>

                {/* Items */}
                {isOpen && (
                  <div className="px-5 pb-4 space-y-1 border-t border-slate-50">
                    {cat.items.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No items yet</p>
                    ) : (
                      cat.items.map((item, ii) => (
                        <div
                          key={ii}
                          className="flex items-center gap-3 py-2 rounded-xl px-1 hover:bg-slate-50 group transition-colors"
                        >
                          <button
                            onClick={() => togglePacked(ci, ii)}
                            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                              item.packed
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-slate-300 hover:border-primary-400'
                            }`}
                          >
                            {item.packed && (
                              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                          <span className={`flex-1 text-sm transition-colors ${
                            item.packed ? 'line-through text-slate-400' : 'text-slate-700'
                          }`}>
                            {item.name}
                          </span>
                          <button
                            onClick={() => deleteItem(ci, ii)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add item button */}
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-4 border-2 border-dashed border-primary-200 rounded-2xl text-primary-600 hover:bg-primary-50 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add item to checklist
          </button>
        </div>

        {/* ===== RIGHT: Summary Sidebar ===== */}
        <div className="space-y-4">
          {/* Progress Donut */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Packing Progress</h3>
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="40" fill="none" stroke="#2563eb" strokeWidth="8"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (251 * pct / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">{pct}%</span>
                <span className="text-[10px] text-slate-400">Packed</span>
              </div>
            </div>

            <div className="space-y-2 text-left mt-2">
              <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-sm text-slate-700"><span className="font-bold">{packedItems}</span> items packed</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 flex-shrink-0" />
                <span className="text-sm text-slate-700"><span className="font-bold">{totalItems - packedItems}</span> remaining</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-sm text-slate-700"><span className="font-bold">{totalItems}</span> total items</span>
              </div>
            </div>
          </div>

          {/* Category Progress */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">By Category</h3>
            <div className="space-y-2.5">
              {categories.map((cat, ci) => {
                const catPct = cat.items.length > 0
                  ? Math.round((cat.items.filter(i => i.packed).length / cat.items.length) * 100)
                  : 0;
                return (
                  <div key={ci}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{cat.name}</span>
                      <span className="text-xs text-slate-400">{catPct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tip card */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
            <p className="text-xs font-semibold text-emerald-700 mb-1">💡 Pro Tip</p>
            <p className="text-xs text-emerald-600 leading-relaxed">Review your checklist at least a day before your trip to avoid last-minute packing stress!</p>
          </div>
        </div>
      </div>

      {/* ===== ADD ITEM MODAL ===== */}
      {showAdd && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setShowAdd(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Add Item</h3>
                <button
                  onClick={() => setShowAdd(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={addCat}
                    onChange={e => setAddCat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  >
                    <option value="">Select category…</option>
                    {categories.map((c, i) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Custom">+ New Category</option>
                  </select>
                </div>
                {addCat === 'Custom' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Category Name</label>
                    <input
                      type="text"
                      value={addCat === 'Custom' ? '' : addCat}
                      onChange={e => setAddCat(e.target.value)}
                      placeholder="e.g. Snorkeling gear"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={addItem}
                    onChange={e => setAddItem(e.target.value)}
                    placeholder="e.g. Sunglasses"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-slate-100">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-5 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!addItem.trim()}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Checklist;
