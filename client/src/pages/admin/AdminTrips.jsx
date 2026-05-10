import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Map, Loader2, Search, Eye, Trash2, Star, Calendar, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { load(); }, [page, statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminAPI.getTrips(params);
      if (data.success) { setTrips(data.trips); setPagination(data.pagination); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const filtered = search ? trips.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()) || t.user?.firstName?.toLowerCase().includes(search.toLowerCase())) : trips;

  const STATUS_COLORS = { draft: 'bg-slate-100 text-slate-600', upcoming: 'bg-blue-100 text-blue-700', active: 'bg-emerald-100 text-emerald-700', completed: 'bg-purple-100 text-purple-700' };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display text-slate-900">Trips Management</h1><p className="text-slate-500 mt-1 text-sm">Monitor and manage all platform trips</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trips or users..." className="flex-1 text-sm bg-transparent outline-none" />
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1">
          {['', 'draft', 'upcoming', 'active', 'completed'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${statusFilter === s ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center"><p className="text-xl font-bold text-slate-900">{pagination.total || 0}</p><p className="text-[10px] text-slate-400">Total Trips</p></div>
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-center"><p className="text-xl font-bold text-blue-700">{trips.filter(t => t.status === 'upcoming').length}</p><p className="text-[10px] text-slate-400">Upcoming</p></div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center"><p className="text-xl font-bold text-emerald-700">{trips.filter(t => t.status === 'active').length}</p><p className="text-[10px] text-slate-400">Active</p></div>
        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4 text-center"><p className="text-xl font-bold text-purple-700">{trips.filter(t => t.status === 'completed').length}</p><p className="text-[10px] text-slate-400">Completed</p></div>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-600 animate-spin" /></div> :
        filtered.length === 0 ? <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center"><Map className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No trips found</p></div> :
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase">Trip</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase">Owner</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase">Dates</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase">Destinations</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-400 uppercase">Budget</th>
              </tr></thead>
              <tbody>{filtered.map(trip => (
                <tr key={trip._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5"><p className="font-semibold text-slate-900">{trip.title}</p><p className="text-[10px] text-slate-400">{trip.tripType || 'General'}</p></td>
                  <td className="px-5 py-3.5"><div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-700">{trip.user?.firstName?.[0]}{trip.user?.lastName?.[0]}</div>
                    <div><p className="text-xs font-medium text-slate-700">{trip.user?.firstName} {trip.user?.lastName}</p><p className="text-[10px] text-slate-400">{trip.user?.email}</p></div>
                  </div></td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{fmt(trip.startDate)}<br />{fmt(trip.endDate)}</td>
                  <td className="px-5 py-3.5"><div className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3 h-3" />{trip.destinations?.length || 0}</div></td>
                  <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[trip.status] || STATUS_COLORS.draft}`}>{trip.status || 'draft'}</span></td>
                  <td className="px-5 py-3.5 text-right text-xs font-semibold text-slate-700">{trip.budget?.total ? `₹${trip.budget.total.toLocaleString()}` : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
            {pagination.pages > 1 && <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Page {page} of {pagination.pages} ({pagination.total} trips)</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>}
          </div>}
    </div>
  );
};

export default AdminTrips;
