import { useState } from 'react';
import { Flag, CheckCircle, Clock, AlertTriangle, Search, Eye, X } from 'lucide-react';

const DEMO_REPORTS = [
  { _id: 'r1', type: 'spam', target: 'Post: "Buy cheap flights now!!!"', reporter: 'Arjun M.', status: 'pending', date: new Date(Date.now() - 3600000 * 2) },
  { _id: 'r2', type: 'inappropriate', target: 'Comment on "Bali Trip"', reporter: 'Meera I.', status: 'pending', date: new Date(Date.now() - 3600000 * 8) },
  { _id: 'r3', type: 'harassment', target: 'User: FakeAccount99', reporter: 'Priya P.', status: 'resolved', date: new Date(Date.now() - 86400000) },
  { _id: 'r4', type: 'spam', target: 'Post: "FREE VISA GUARANTEED"', reporter: 'Kabir S.', status: 'resolved', date: new Date(Date.now() - 86400000 * 2) },
  { _id: 'r5', type: 'misinformation', target: 'Post: "No visa needed for USA"', reporter: 'Rohan S.', status: 'pending', date: new Date(Date.now() - 86400000 * 3) },
];

const AdminReports = () => {
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [filter, setFilter] = useState('all');

  const resolve = (id) => setReports(rs => rs.map(r => r._id === id ? { ...r, status: 'resolved' } : r));
  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  const TYPE_COLOR = { spam: 'bg-red-100 text-red-700', inappropriate: 'bg-amber-100 text-amber-700', harassment: 'bg-purple-100 text-purple-700', misinformation: 'bg-orange-100 text-orange-700' };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold font-display text-slate-900">Reports & Flags</h1><p className="text-slate-500 mt-1 text-sm">Review and resolve user reports</p></div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center"><p className="text-xl font-bold text-slate-900">{reports.length}</p><p className="text-[10px] text-slate-400">Total Reports</p></div>
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-center"><p className="text-xl font-bold text-amber-700">{reports.filter(r => r.status === 'pending').length}</p><p className="text-[10px] text-slate-400">Pending</p></div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center"><p className="text-xl font-bold text-emerald-700">{reports.filter(r => r.status === 'resolved').length}</p><p className="text-[10px] text-slate-400">Resolved</p></div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-6 w-fit">
        {['all', 'pending', 'resolved'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize ${filter === f ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{f}</button>)}
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r._id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.status === 'resolved' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              {r.status === 'resolved' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${TYPE_COLOR[r.type] || 'bg-slate-100 text-slate-600'}`}>{r.type}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${r.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{r.target}</p>
              <p className="text-[10px] text-slate-400">Reported by {r.reporter} · {fmt(r.date)}</p>
            </div>
            {r.status !== 'resolved' && <button onClick={() => resolve(r._id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100">Resolve</button>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
