import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Server, Loader2, Database, Cpu, HardDrive, Activity, CheckCircle, AlertTriangle, Clock, Layers, RefreshCw } from 'lucide-react';

const AdminSystem = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const { data } = await adminAPI.getSystemHealth(); if (data.success) setHealth(data.health); } catch (e) { console.error(e); } finally { setLoading(false); } };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  if (!health) return <div className="text-center py-12 text-slate-500">Failed to load system health</div>;

  const memPct = health.memory.usagePercent;
  const memColor = memPct > 85 ? 'text-red-600 bg-red-50' : memPct > 60 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display text-slate-900">System Monitoring</h1><p className="text-slate-500 mt-1 text-sm">Server status, database health, and system metrics</p></div>
        <button onClick={load} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      {/* Status Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><Server className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="text-xs text-slate-400">Server</p><p className="text-sm font-bold text-emerald-600 capitalize">{health.server.status}</p></div>
          </div>
          <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-400" /><span className="text-xs text-slate-500">Uptime: {health.server.uptimeFormatted}</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${health.database.status === 'connected' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <Database className={`w-5 h-5 ${health.database.status === 'connected' ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
            <div><p className="text-xs text-slate-400">Database</p><p className={`text-sm font-bold capitalize ${health.database.status === 'connected' ? 'text-emerald-600' : 'text-red-600'}`}>{health.database.status}</p></div>
          </div>
          <p className="text-xs text-slate-500">DB: {health.database.name}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${memColor.split(' ')[1]}`}>
              <Cpu className={`w-5 h-5 ${memColor.split(' ')[0]}`} />
            </div>
            <div><p className="text-xs text-slate-400">Memory</p><p className={`text-sm font-bold ${memColor.split(' ')[0]}`}>{memPct}% used</p></div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${memPct > 85 ? 'bg-red-500' : memPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${memPct}%` }} /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center"><Activity className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-xs text-slate-400">Node.js</p><p className="text-sm font-bold text-slate-900">{health.node.version}</p></div>
          </div>
          <p className="text-xs text-slate-500 capitalize">Platform: {health.node.platform}</p>
        </div>
      </div>

      {/* Collections */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-primary-600" />Database Collections</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(health.collections).map(([key, val]) => (
            <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center"><Database className="w-4 h-4 text-primary-500" /></div>
              <div><p className="text-sm font-bold text-slate-900">{val.toLocaleString()}</p><p className="text-[10px] text-slate-400 capitalize">{key}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Details */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><HardDrive className="w-4 h-4 text-primary-600" />Memory Details</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl text-center"><p className="text-lg font-bold text-slate-900">{(health.memory.total / 1024).toFixed(1)} GB</p><p className="text-[10px] text-slate-400">Total Memory</p></div>
          <div className="p-4 bg-slate-50 rounded-xl text-center"><p className="text-lg font-bold text-primary-600">{(health.memory.used / 1024).toFixed(1)} GB</p><p className="text-[10px] text-slate-400">Used Memory</p></div>
          <div className="p-4 bg-slate-50 rounded-xl text-center"><p className="text-lg font-bold text-emerald-600">{(health.memory.free / 1024).toFixed(1)} GB</p><p className="text-[10px] text-slate-400">Free Memory</p></div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystem;
