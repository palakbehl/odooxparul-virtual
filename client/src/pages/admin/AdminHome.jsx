// ==========================================
// Admin Dashboard Home - Traveloop
// Dynamic analytics from backend API
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import {
  Search, Filter, ChevronDown, ArrowRight, MapPin,
  Info, Star, TrendingUp, BarChart3, Loader2
} from 'lucide-react';

const AdminHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const donutRef = useRef(null);
  const barRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Load admin stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Draw donut chart
  useEffect(() => {
    if (!stats || !donutRef.current) return;
    const canvas = donutRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 200;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 75;
    const lineWidth = 28;
    const total = stats.totalUsers || 1;
    const segments = [
      { value: stats.activeUsers, color: '#22c55e' },
      { value: stats.newUsers, color: '#3b82f6' },
      { value: stats.inactiveUsers, color: '#cbd5e1' },
    ];

    let startAngle = -Math.PI / 2;
    segments.forEach(seg => {
      const sweep = (seg.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweep);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      startAngle += sweep + 0.04;
    });

    // Center text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stats.totalUsers.toLocaleString(), cx, cy - 8);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Total Users', cx, cy + 14);
  }, [stats]);

  // Draw bar chart
  useEffect(() => {
    if (!stats?.popularDestinations?.length || !barRef.current) return;
    const canvas = barRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 340;
    const h = 220;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const data = stats.popularDestinations.slice(0, 3);
    const maxVal = Math.max(...data.map(d => d.totalTrips), 1);
    const barWidth = 60;
    const gap = 30;
    const startX = 40;
    const chartBottom = h - 30;
    const chartTop = 20;
    const chartHeight = chartBottom - chartTop;
    const colors = ['#ef4444', '#f97316', '#facc15'];

    // Y axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = chartBottom - (i / 4) * chartHeight;
      const val = Math.round((i / 4) * maxVal);
      ctx.fillText(val.toString(), startX - 8, y + 4);
      ctx.beginPath();
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.moveTo(startX, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }

    // Bars
    data.forEach((d, i) => {
      const x = startX + i * (barWidth + gap) + gap;
      const barHeight = (d.totalTrips / maxVal) * chartHeight;
      const y = chartBottom - barHeight;

      // Gradient bar
      const grad = ctx.createLinearGradient(x, y, x, chartBottom);
      grad.addColorStop(0, colors[i]);
      grad.addColorStop(1, colors[i] + '80');
      ctx.fillStyle = grad;

      // Rounded rect
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, chartBottom);
      ctx.lineTo(x, chartBottom);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();

      // Label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = d.name?.length > 10 ? d.name.slice(0, 10) + '..' : (d.name || 'Unknown');
      ctx.fillText(label, x + barWidth / 2, chartBottom + 15);
    });
  }, [stats]);

  // Draw line chart
  useEffect(() => {
    if (!stats?.activityTrend?.length || !lineRef.current) return;
    const canvas = lineRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 380;
    const h = 220;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const data = stats.activityTrend;
    const maxVal = Math.max(...data.map(d => d.activeUsers), 1);
    const padding = { top: 20, right: 20, bottom: 35, left: 45 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Y grid + labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH - (i / 4) * chartH;
      const val = Math.round((i / 4) * maxVal);
      ctx.fillText(val.toString(), padding.left - 8, y + 4);
      ctx.beginPath();
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    // X labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    data.forEach((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      ctx.fillText(d.date, x, h - 8);
    });

    // Line + gradient fill
    const points = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartW,
      y: padding.top + chartH - (d.activeUsers / maxVal) * chartH
    }));

    // Fill gradient
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cpx = (points[i - 1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cpx, points[i - 1].y, cpx, points[i].y, points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });
  }, [stats]);

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
        <h1 className="text-[28px] font-bold font-display text-slate-900 leading-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.firstName}! Here's what's happening on Traveloop.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 border border-slate-200 rounded-2xl mb-6">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users, trips, destinations..."
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm placeholder-slate-400 focus:outline-none border-none"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            Group by
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            Sort by
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT + CENTER COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Row: User Overview + Activity Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Overview - Donut */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">User Overview</h3>
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-600">Active Users</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">{stats?.activeUsers?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs text-slate-600">New Users</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">{stats?.newUsers?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-600">Inactive Users</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">{stats?.inactiveUsers?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <canvas ref={donutRef} className="shrink-0" />
              </div>
            </div>

            {/* User Activity Trend - Line */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">User Activity Trend</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium hover:bg-slate-100">
                  {timeRange}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <canvas ref={lineRef} className="w-full" />
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Popular Destinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <canvas ref={barRef} className="w-full" />

              {/* Table */}
              <div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Destination</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total Trips</span>
                </div>
                {stats?.popularDestinations?.length > 0 ? (
                  stats.popularDestinations.map((d, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 py-2.5 border-t border-slate-50">
                      <span className="text-sm text-slate-700 font-medium">{d.destination || d.name}</span>
                      <span className="text-sm text-slate-900 font-bold text-right">{d.totalTrips?.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 py-4 text-center">No destination data yet</p>
                )}
              </div>
            </div>
            <div className="mt-4 text-center">
              <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700">
                View full report <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Info Panel + Top Cities */}
        <div className="space-y-6">
          {/* About This Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">About This Section</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              This section is responsible for managing the users and their actions. This section will the admin the access to view all the trips made by the user. Also other functionalities are welcome.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Popular cities:</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Lists all the popular cities where the users are visiting based on the current user trends.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Popular Activities:</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">List all the popular activities that the users are doing based on the current user trend data.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">User Trends & Analytics:</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">This section will major focus on the providing analysis across various points and give useful information to the user.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Cities */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Top Cities</h3>
              <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View all</button>
            </div>
            <div className="space-y-3">
              {stats?.popularDestinations?.length > 0 ? (
                stats.popularDestinations.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 font-medium">{d.destination || d.name}</span>
                    </div>
                    <span className="text-sm text-slate-500 font-medium">{d.totalTrips?.toLocaleString()} trips</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
