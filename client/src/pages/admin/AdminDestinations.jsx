import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Globe, Loader2, MapPin, Star, TrendingUp, Plus, Search, Eye, EyeOff } from 'lucide-react';

const AdminDestinations = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getStats();
      if (data.success) setStats(data.stats);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const FEATURED = [
    { name: 'Paris', country: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&q=80', trips: 42, featured: true },
    { name: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&q=80', trips: 38, featured: true },
    { name: 'Bali', country: 'Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&q=80', trips: 35, featured: true },
    { name: 'Dubai', country: 'UAE', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300&q=80', trips: 31, featured: true },
    { name: 'Rome', country: 'Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&q=80', trips: 28, featured: false },
    { name: 'Jaipur', country: 'India', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=300&q=80', trips: 25, featured: false },
  ];

  const [destinations, setDestinations] = useState(FEATURED);
  const toggleFeatured = (i) => setDestinations(ds => ds.map((d, idx) => idx === i ? { ...d, featured: !d.featured } : d));
  const filtered = search ? destinations.filter(d => d.name.toLowerCase().includes(search.toLowerCase())) : destinations;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display text-slate-900">Destinations</h1><p className="text-slate-500 mt-1 text-sm">Manage featured and trending destinations</p></div>
      </div>

      <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-3 py-2.5 mb-6 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search destinations..." className="flex-1 text-sm bg-transparent outline-none" />
      </div>

      {/* Popular from DB */}
      {stats?.popularDestinations?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-600" />Trending (from user trips)</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.popularDestinations.map((d, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">{i + 1}</div>
                <div className="flex-1"><p className="text-sm font-semibold text-slate-900">{d.destination}</p><p className="text-[10px] text-slate-400">{d.totalTrips} trips</p></div>
                <Star className="w-4 h-4 text-amber-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Grid */}
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-primary-600" />All Destinations</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-32"><img src={d.img} alt={d.name} className="w-full h-full object-cover" />
              {d.featured && <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full uppercase">Featured</span>}
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-slate-900">{d.name}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{d.country}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span className="text-xs text-slate-500">{d.trips} trips</span>
                <button onClick={() => toggleFeatured(i)} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-semibold ${d.featured ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
                  {d.featured ? <><Star className="w-3 h-3" />Featured</> : <><Eye className="w-3 h-3" />Feature</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDestinations;
