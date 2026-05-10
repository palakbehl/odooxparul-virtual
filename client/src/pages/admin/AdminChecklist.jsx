// ==========================================
// Admin Checklist Overview Page - Traveloop
// Platform-wide checklist data from database
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import {
  CheckSquare, Square, Loader2, Luggage,
  Shirt, Pill, Camera, FileText, TrendingUp,
  Users, BarChart3, CheckCircle
} from 'lucide-react';

const categoryConfig = {
  general: { label: 'General', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', bar: 'bg-slate-400' },
  clothing: { label: 'Clothing', icon: Shirt, color: 'text-blue-500', bg: 'bg-blue-50', bar: 'bg-blue-500' },
  toiletries: { label: 'Toiletries', icon: Pill, color: 'text-emerald-500', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
  electronics: { label: 'Electronics', icon: Camera, color: 'text-purple-500', bg: 'bg-purple-50', bar: 'bg-purple-500' },
  documents: { label: 'Documents', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50', bar: 'bg-amber-500' },
};

const AdminChecklist = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const donutRef = useRef(null);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const { data: res } = await adminAPI.getChecklist();
      if (res.success) setData(res);
    } catch (err) {
      console.error('Load checklist error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Draw completion donut
  useEffect(() => {
    if (!data?.summary || !donutRef.current) return;
    const canvas = donutRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 160;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 58;
    const lineWidth = 20;
    const total = data.summary.totalItems || 1;

    const segments = [
      { value: data.summary.checkedItems, color: '#22c55e' },
      { value: data.summary.uncheckedItems, color: '#e2e8f0' },
    ];

    let startAngle = -Math.PI / 2;
    segments.forEach(seg => {
      const sweep = (seg.value / total) * 2 * Math.PI;
      if (sweep > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + sweep);
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
        startAngle += sweep + 0.03;
      }
    });

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.summary.completionRate + '%', cx, cy - 5);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Packed', cx, cy + 12);
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
        <h1 className="text-[28px] font-bold font-display text-slate-900 leading-tight">Checklist Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Platform-wide packing checklist statistics across all users.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <Luggage className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data?.tripsWithChecklist || 0}</p>
              <p className="text-xs text-slate-500">Trips w/ Checklists</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data?.summary?.totalItems?.toLocaleString() || 0}</p>
              <p className="text-xs text-slate-500">Total Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data?.summary?.checkedItems?.toLocaleString() || 0}</p>
              <p className="text-xs text-slate-500">Items Packed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data?.summary?.completionRate || 0}%</p>
              <p className="text-xs text-slate-500">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left + Center */}
        <div className="lg:col-span-2 space-y-6">
          {/* Popular Items */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Most Popular Packing Items</h3>
            </div>
            {data?.popularItems?.length > 0 ? (
              <>
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2 text-center">Total Uses</div>
                  <div className="col-span-3 text-right">Packed Rate</div>
                </div>
                {data.popularItems.map((item, i) => {
                  const cat = categoryConfig[item.category] || categoryConfig.general;
                  const CatIcon = cat.icon;
                  const rate = item.count > 0 ? Math.round((item.checkedCount / item.count) * 100) : 0;
                  return (
                    <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center">
                      <div className="col-span-5 flex items-center gap-2.5">
                        <div className={`w-8 h-8 ${cat.bg} rounded-lg flex items-center justify-center`}>
                          <CatIcon className={`w-4 h-4 ${cat.color}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-800 capitalize">{item.item}</span>
                      </div>
                      <div className="col-span-2">
                        <span className={`inline-block px-2 py-0.5 ${cat.bg} rounded-full text-[10px] font-bold ${cat.color} uppercase`}>
                          {cat.label}
                        </span>
                      </div>
                      <div className="col-span-2 text-center text-sm font-semibold text-slate-700">{item.count}</div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="flex-1 max-w-[80px] h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${rate > 70 ? 'bg-emerald-500' : rate > 40 ? 'bg-amber-500' : 'bg-red-400'} transition-all`}
                              style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-10 text-right">{rate}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-16">
                <Luggage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No checklist items yet</p>
              </div>
            )}
          </div>

          {/* Top Completed Trips */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Best Prepared Trips</h3>
            </div>
            {data?.topCompleted?.length > 0 ? (
              <>
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-4">Trip</div>
                  <div className="col-span-3">User</div>
                  <div className="col-span-2 text-center">Items</div>
                  <div className="col-span-3 text-right">Completion</div>
                </div>
                {data.topCompleted.map((t, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center">
                    <div className="col-span-4">
                      <p className="text-sm font-semibold text-slate-800">{t.tripTitle}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm text-slate-600">{t.userName?.trim() || 'Unknown'}</p>
                    </div>
                    <div className="col-span-2 text-center text-sm text-slate-600">{t.checked}/{t.total}</div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="flex-1 max-w-[80px] h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${t.rate === 100 ? 'bg-emerald-500' : t.rate > 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                            style={{ width: `${t.rate}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-10 text-right">{t.rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No completed checklists</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Completion Donut */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Overall Completion</h3>
            <div className="flex flex-col items-center">
              <canvas ref={donutRef} className="mb-4" />
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600">Packed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-200" />
                  <span className="text-xs text-slate-600">Not Packed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">By Category</h3>
            {data?.categoryBreakdown?.length > 0 ? (
              <div className="space-y-4">
                {data.categoryBreakdown.map((c, i) => {
                  const cat = categoryConfig[c.category] || categoryConfig.general;
                  const CatIcon = cat.icon;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <CatIcon className={`w-4 h-4 ${cat.color}`} />
                          <span className="text-sm font-medium text-slate-700 capitalize">{cat.label}</span>
                        </div>
                        <span className="text-xs text-slate-500">{c.checked}/{c.total} ({c.rate}%)</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cat.bar} transition-all duration-500`}
                          style={{ width: `${c.rate}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChecklist;
