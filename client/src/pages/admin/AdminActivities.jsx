// ==========================================
// Admin Popular Activities Page - Traveloop
// All data from database aggregation
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import {
  Star, MapPin, DollarSign, Activity, TrendingUp,
  Loader2, BarChart3, CheckCircle, Zap
} from 'lucide-react';

const categoryConfig = {
  general: { color: '#64748b', bg: 'bg-slate-50' },
  clothing: { color: '#3b82f6', bg: 'bg-blue-50' },
  toiletries: { color: '#10b981', bg: 'bg-emerald-50' },
  electronics: { color: '#8b5cf6', bg: 'bg-purple-50' },
  documents: { color: '#f59e0b', bg: 'bg-amber-50' },
};

const AdminActivities = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const barRef = useRef(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data: res } = await adminAPI.getActivities();
      if (res.success) setData(res);
    } catch (err) {
      console.error('Load activities error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Draw horizontal bar chart for destination activities
  useEffect(() => {
    if (!data?.destinationActivities?.length || !barRef.current) return;
    const canvas = barRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const items = data.destinationActivities.slice(0, 6);
    const w = 500;
    const h = items.length * 48 + 30;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const maxVal = Math.max(...items.map(d => d.activityCount), 1);
    const barMaxW = w - 160;
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

    items.forEach((d, i) => {
      const y = i * 48 + 20;
      const barW = (d.activityCount / maxVal) * barMaxW;

      // Label
      ctx.fillStyle = '#334155';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(d.destination || 'Unknown', 10, y + 4);

      // Bar
      const grad = ctx.createLinearGradient(120, y - 8, 120 + barW, y - 8);
      grad.addColorStop(0, colors[i % colors.length]);
      grad.addColorStop(1, colors[i % colors.length] + '80');
      ctx.fillStyle = grad;
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(120 + r, y - 12);
      ctx.lineTo(120 + barW - r, y - 12);
      ctx.quadraticCurveTo(120 + barW, y - 12, 120 + barW, y - 12 + r);
      ctx.lineTo(120 + barW, y + 4);
      ctx.lineTo(120, y + 4);
      ctx.lineTo(120, y - 12 + r);
      ctx.quadraticCurveTo(120, y - 12, 120 + r, y - 12);
      ctx.fill();

      // Value
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(d.activityCount.toString(), 120 + barW + 8, y + 2);
    });
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold font-display text-slate-900 leading-tight">Popular Activities</h1>
        <p className="text-slate-500 text-sm mt-1">What travelers are doing across all trips on the platform.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data?.summary?.totalActivities?.toLocaleString() || 0}</p>
              <p className="text-xs text-slate-500">Total Activities</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data?.summary?.completedActivities?.toLocaleString() || 0}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">${data?.summary?.totalActivityCost?.toLocaleString() || 0}</p>
              <p className="text-xs text-slate-500">Total Cost</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data?.tripTypes?.length || 0}</p>
              <p className="text-xs text-slate-500">Trip Types</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Activities Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Top Activities Across All Trips</h3>
          </div>
          {data?.activities?.length > 0 ? (
            <>
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-5">Activity</div>
                <div className="col-span-2 text-center">Count</div>
                <div className="col-span-2 text-right">Avg Cost</div>
                <div className="col-span-3 text-right">Total Cost</div>
              </div>
              {data.activities.map((a, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center">
                  <div className="col-span-5 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center text-primary-600 text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-800 truncate">{a.activity}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{a.count}</span>
                  </div>
                  <div className="col-span-2 text-right text-sm text-slate-600">${a.avgCost}</div>
                  <div className="col-span-3 text-right text-sm font-semibold text-slate-900">${a.totalCost}</div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-16">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No activities recorded yet</p>
              <p className="text-slate-400 text-sm mt-1">Activities from trip itineraries will appear here</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Destinations by Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Destinations by Activity Count</h3>
            {data?.destinationActivities?.length > 0 ? (
              <canvas ref={barRef} className="w-full" />
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
            )}
          </div>

          {/* Trip Types */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Trip Types</h3>
            {data?.tripTypes?.length > 0 ? (
              <div className="space-y-3">
                {data.tripTypes.map((t, i) => {
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'];
                  const maxCount = Math.max(...data.tripTypes.map(x => x.count));
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700 capitalize">{t.type || 'Other'}</span>
                        <span className="text-xs font-bold text-slate-900">{t.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-500`}
                          style={{ width: `${(t.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No trip types set</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivities;
