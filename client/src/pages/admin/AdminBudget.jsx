// ==========================================
// Admin Budget Overview Page - Traveloop
// Platform-wide budget data from database
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import {
  DollarSign, TrendingUp, PieChart, Users,
  Loader2, CreditCard, BarChart3, Wallet
} from 'lucide-react';

const AdminBudget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const donutRef = useRef(null);

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      const { data: res } = await adminAPI.getBudget();
      if (res.success) setData(res);
    } catch (err) {
      console.error('Load budget error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Draw donut for budgeted vs spent
  useEffect(() => {
    if (!data?.overview || !donutRef.current) return;
    const canvas = donutRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 180;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 65;
    const lineWidth = 24;
    const total = data.overview.totalBudgeted || 1;
    const spent = data.overview.totalSpent || 0;
    const remaining = Math.max(total - spent, 0);

    const segments = [
      { value: spent, color: '#ef4444' },
      { value: remaining, color: '#22c55e' },
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

    const pct = total > 0 ? Math.round((spent / total) * 100) : 0;
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pct + '%', cx, cy - 6);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Spent', cx, cy + 12);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-slate-100 text-slate-600',
    upcoming: 'bg-blue-50 text-blue-600',
    active: 'bg-emerald-50 text-emerald-600',
    completed: 'bg-purple-50 text-purple-600',
    cancelled: 'bg-red-50 text-red-600',
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold font-display text-slate-900 leading-tight">Budget Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Platform-wide financial insights across all user trips.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">${data?.overview?.totalBudgeted?.toLocaleString() || 0}</p>
              <p className="text-[11px] text-slate-500">Total Budgeted</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">${data?.overview?.totalSpent?.toLocaleString() || 0}</p>
              <p className="text-[11px] text-slate-500">Total Spent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">${data?.overview?.avgBudget?.toLocaleString() || 0}</p>
              <p className="text-[11px] text-slate-500">Avg Budget</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">${data?.overview?.avgSpent?.toLocaleString() || 0}</p>
              <p className="text-[11px] text-slate-500">Avg Spent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{data?.overview?.tripsWithBudget || 0}</p>
              <p className="text-[11px] text-slate-500">Trips w/ Budget</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left + Center */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget by Status */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Budget by Trip Status</h3>
            </div>
            {data?.budgetByStatus?.length > 0 ? (
              <>
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-3">Status</div>
                  <div className="col-span-2 text-center">Trips</div>
                  <div className="col-span-3 text-right">Budgeted</div>
                  <div className="col-span-2 text-right">Spent</div>
                  <div className="col-span-2 text-right">Usage</div>
                </div>
                {data.budgetByStatus.map((b, i) => {
                  const pct = b.totalBudget > 0 ? Math.round((b.totalSpent / b.totalBudget) * 100) : 0;
                  return (
                    <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center">
                      <div className="col-span-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[b.status] || 'bg-slate-100 text-slate-600'}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="col-span-2 text-center text-sm font-semibold text-slate-700">{b.count}</div>
                      <div className="col-span-3 text-right text-sm text-slate-700">${b.totalBudget.toLocaleString()}</div>
                      <div className="col-span-2 text-right text-sm font-semibold text-slate-900">${b.totalSpent.toLocaleString()}</div>
                      <div className="col-span-2 text-right">
                        <span className={`text-sm font-bold ${pct > 90 ? 'text-red-600' : pct > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No budget data</p>
              </div>
            )}
          </div>

          {/* Top Spenders */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Top Spenders</h3>
            </div>
            {data?.topSpenders?.length > 0 ? (
              <>
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-5">User</div>
                  <div className="col-span-3 text-center">Trips</div>
                  <div className="col-span-4 text-right">Total Spent</div>
                </div>
                {data.topSpenders.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {s.firstName?.[0]}{s.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </div>
                    </div>
                    <div className="col-span-3 text-center text-sm font-medium text-slate-700">{s.tripCount}</div>
                    <div className="col-span-4 text-right text-sm font-bold text-slate-900">${s.totalSpent.toLocaleString()}</div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No spending data</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Donut: Spent vs Remaining */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Spent vs Remaining</h3>
            <div className="flex flex-col items-center">
              <canvas ref={donutRef} className="mb-4" />
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-slate-600">Spent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600">Remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Currency Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">By Currency</h3>
            {data?.currencyBreakdown?.length > 0 ? (
              <div className="space-y-3">
                {data.currencyBreakdown.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{c.currency}</p>
                      <p className="text-xs text-slate-400">{c.count} trips</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">${c.totalBudget.toLocaleString()}</p>
                      <p className="text-xs text-red-500">-${c.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No data</p>
            )}
          </div>

          {/* Activity Costs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Activity Costs</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-700">${data?.activityCosts?.total?.toLocaleString() || 0}</p>
                <p className="text-[10px] text-blue-500 font-medium">Total</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-700">${data?.activityCosts?.avg?.toLocaleString() || 0}</p>
                <p className="text-[10px] text-emerald-500 font-medium">Average</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-amber-700">${data?.activityCosts?.max?.toLocaleString() || 0}</p>
                <p className="text-[10px] text-amber-500 font-medium">Highest</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-purple-700">{data?.activityCosts?.count?.toLocaleString() || 0}</p>
                <p className="text-[10px] text-purple-500 font-medium">Activities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBudget;
