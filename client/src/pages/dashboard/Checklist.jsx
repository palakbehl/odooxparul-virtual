import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import {
  CheckSquare, Plus, Trash2, RotateCcw, Share2, ChevronUp, ChevronDown,
  FileText, Shirt, Smartphone, Heart, Briefcase, Loader2, X
} from 'lucide-react';

// Map icon keys to actual components (so we can store key strings in localStorage)
const ICON_MAP = { FileText, Shirt, Smartphone, Heart, Briefcase };

const DEFAULT_CATS = [
  { name: 'Documents', iconKey: 'FileText', color: 'bg-blue-500', items: ['Passport', 'Flight Tickets (printed)', 'Travel insurance', 'Hotel booking confirmation', 'Visa documents', 'ID cards'] },
  { name: 'Clothing', iconKey: 'Shirt', color: 'bg-emerald-500', items: ['Casual Shirts', 'Trousers / jeans', 'Comfortable walking shoes', 'Light jacket / windbreaker', 'Swimwear', 'Sleepwear'] },
  { name: 'Electronics', iconKey: 'Smartphone', color: 'bg-purple-500', items: ['Phone charger', 'Universal power adapter', 'Earphone / headphones', 'Camera', 'Portable battery'] },
  { name: 'Medical', iconKey: 'Heart', color: 'bg-red-500', items: ['Personal medications', 'First-aid kit', 'Sunscreen', 'Hand sanitizer', 'Masks'] },
  { name: 'Essentials', iconKey: 'Briefcase', color: 'bg-amber-500', items: ['Wallet / cash', 'Travel pillow', 'Water bottle', 'Snacks', 'Umbrella', 'Locks / padlocks'] }
];

const Checklist = () => {
  const [trips, setTrips] = useState([]);
  const [tp, setTp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addCat, setAddCat] = useState('');
  const [addItem, setAddItem] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadTrips(); }, []);

  useEffect(() => {
    if (tp) {
      const key = `checklist_${tp._id}`;
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
  }, [tp]);

  useEffect(() => {
    if (tp && categories.length > 0) {
      localStorage.setItem(`checklist_${tp._id}`, JSON.stringify(categories));
    }
  }, [categories, tp]);

  const initDefaults = () => {
    setCategories(DEFAULT_CATS.map(c => ({
      name: c.name, iconKey: c.iconKey, color: c.color,
      items: c.items.map(i => ({ name: i, packed: false }))
    })));
  };

  const loadTrips = async () => {
    try {
      const { data } = await tripAPI.getAll({});
      if (data.success && data.trips.length > 0) {
        setTrips(data.trips);
        setTp(data.trips[0]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
      ...c, items: c.items.map(i => ({ ...i, packed: false }))
    })));
  };

  const handleAdd = () => {
    if (!addItem.trim()) return;
    const ci = categories.findIndex(c => c.name === addCat);
    if (ci > -1) {
      const cats = [...categories];
      cats[ci] = { ...cats[ci], items: [...cats[ci].items, { name: addItem, packed: false }] };
      setCategories(cats);
    } else {
      setCategories([...categories, {
        name: addCat || 'Custom', iconKey: 'Briefcase', color: 'bg-slate-500',
        items: [{ name: addItem, packed: false }]
      }]);
    }
    setAddItem('');
    setShowAdd(false);
  };

  const shareChecklist = () => {
    const lines = [`🧳 Packing Checklist — ${tp?.title || 'Trip'}\n`];
    categories.forEach(cat => {
      lines.push(`\n📦 ${cat.name}`);
      cat.items.forEach(item => {
        lines.push(`  ${item.packed ? '✅' : '⬜'} ${item.name}`);
      });
    });
    lines.push(`\n---\nProgress: ${packedItems}/${totalItems} packed (${pct}%)`);
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const packedItems = categories.reduce((s, c) => s + c.items.filter(i => i.packed).length, 0);
  const pct = totalItems > 0 ? Math.round(packedItems / totalItems * 100) : 0;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <Link to="/dashboard/trips" className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-2 inline-block">← Back to My Trips</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Packing Checklist</h1>
          {tp && <p className="text-slate-500 mt-1">Trip: {tp.title}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={resetAll} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
            <RotateCcw className="w-4 h-4" />Reset all
          </button>
          <button onClick={shareChecklist} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">
            <Share2 className="w-4 h-4" />{copied ? 'Copied!' : 'Share Checklist'}
          </button>
        </div>
      </div>
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
                      className={`w-full text-left p-3 rounded-xl transition-all ${currentTrip?._id === trip._id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-slate-50 border border-transparent'
                        }`}
                    >
                      <p className={`text-sm font-semibold ${currentTrip?._id === trip._id ? 'text-primary-700' : 'text-slate-700'}`}>{trip.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{(trip.checklist || []).length} items</p>
                    </button>
                  ))}
                </div>
              </div>

              {trips.length > 1 && (
                <div className="mb-4">
                  <select value={tp?._id || ''} onChange={e => setTp(trips.find(t => t._id === e.target.value))} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm">
                    {trips.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                  </select>
                </div>
              )}

              <div className="grid lg:grid-cols-[1fr_280px] gap-6">
                <div>
                  {/* Progress */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
                    <p className="text-sm text-slate-700 mb-2">Progress: <span className="font-bold">{packedItems}/{totalItems} items packed</span></p>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-4 mb-6">
                    {categories.map((cat, ci) => {
                      const CatIcon = ICON_MAP[cat.iconKey] || Briefcase;
                      const catPacked = cat.items.filter(i => i.packed).length;
                      const isOpen = !collapsed[ci];

                      return (
                        <div key={ci} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                          <button onClick={() => setCollapsed({ ...collapsed, [ci]: isOpen })} className="w-full flex items-center justify-between p-4 hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${cat.color} rounded-lg flex items-center justify-center`}>
                                <CatIcon className="w-4 h-4 text-white" />
                              </div>
                              <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{catPacked}/{cat.items.length}</span>
                              {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="px-4 pb-4 space-y-1">
                              {cat.items.map((item, ii) => (
                                <div key={ii} className="flex items-center gap-3 py-2 group">
                                  <button
                                    onClick={() => togglePacked(ci, ii)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${item.packed ? 'bg-primary-600 border-primary-600' : 'border-slate-300 hover:border-primary-400'}`}
                                  >
                                    {item.packed && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                  </button>
                                  <span className={`flex-1 text-sm ${item.packed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.name}</span>
                                  <button onClick={() => deleteItem(ci, ii)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded">
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add item button */}
                  <button onClick={() => setShowAdd(true)} className="w-full py-4 border-2 border-dashed border-primary-200 rounded-2xl text-primary-600 hover:bg-primary-50 text-sm font-semibold flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" />Add item to checklist
                  </button>
                </div>

                {/* Sidebar summary */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Checklist Summary</h3>
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#2563eb" strokeWidth="8" strokeDasharray={251} strokeDashoffset={251 - (251 * pct / 100)} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">{pct}%</span>
                        <span className="text-[10px] text-slate-400">Packed</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-emerald-500" /><span className="text-sm"><span className="font-bold">{packedItems}</span> Packed</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-300 rounded" /><span className="text-sm"><span className="font-bold">{totalItems - packedItems}</span> Pending</span></div>
                      <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /><span className="text-sm"><span className="font-bold">{totalItems}</span> Total Items</span></div>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">💡 Tip</p>
                    <p className="text-xs text-emerald-600">Make sure to review your checklist a day before your trip!</p>
                  </div>
                </div>
              </div>

              {/* ADD MODAL */}
              {showAdd && (<>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowAdd(false)} />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                      <h3 className="font-bold">Add Item</h3>
                      <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                        <select value={addCat} onChange={e => setAddCat(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                          <option value="">Select category</option>
                          {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                          <option value="Custom">+ New Category</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Item Name *</label>
                        <input value={addItem} onChange={e => setAddItem(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 p-5 border-t border-slate-100">
                      <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 text-slate-600 text-sm">Cancel</button>
                      <button onClick={handleAdd} disabled={!addItem.trim()} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60">Add</button>
                    </div>
                  </div>
                </div>
              </>)}
            </div>
            );
};

            export default Checklist;
