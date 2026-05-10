// ==========================================
// Admin Analytics Page - Traveloop
// User Trends & Analytics from database
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import {
  TrendingUp, Users, MapPin, Clock, Globe,
  Loader2, DollarSign, UserPlus, Plane
} from 'lucide-react';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const regRef = useRef(null);
  const tripRef = useRef(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: res } = await adminAPI.getAnalytics();
      if (res.success) setData(res);
    } catch (err) {
      console.error('Load analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Draw registration trend chart
  useEffect(() => {
    if (!data?.registrationTrend?.length || !regRef.current) return;
    drawLineChart(regRef.current, data.registrationTrend, 'users', '#3b82f6', 'rgba(59,130,246,0.1)');
  }, [data]);

  // Draw trip creation trend chart
  useEffect(() => {
    if (!data?.tripCreationTrend?.length || !tripRef.current) return;
    drawLineChart(tripRef.current, data.tripCreationTrend, 'trips', '#22c55e', 'rgba(34,197,94,0.1)');
  }, [data]);

  const drawLineChart = (canvas, items, key, lineColor, fillColor) => {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 520;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const padding = { top: 15, right: 15, bottom: 30, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const maxVal = Math.max(...items.map(d => d[key]), 1);

    // Grid
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH - (i / 4) * chartH;
      ctx.fillText(Math.round((i / 4) * maxVal).toString(), padding.left - 6, y + 3);
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
    ctx.font = '9px Inter, sans-serif';
    items.forEach((d, i) => {
      if (i % 2 === 0 || items.length <= 7) {
        const x = padding.left + (i / (items.length - 1)) * chartW;
        ctx.fillText(d.month, x, h - 6);
      }
    });

    const points = items.map((d, i) => ({
      x: padding.left + (i / (items.length - 1)) * chartW,
      y: padding.top + chartH - (d[key] / maxVal) * chartH
    }));

    // Fill
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
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
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });
  };

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
        <h1 className="text-[28px] font-bold font-display text-slate-900 leading-tight">User Trends & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">In-depth analysis of user registrations, trip patterns, and platform usage over time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">${data?.avgBudget?.avgTotal?.toLocaleString() || 0}</p>
              <p className="text-xs text-slate-500">Avg Budget/Trip</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">${data?.avgBudget?.avgSpent?.toLocaleString() || 0}</p>
              <p className="text-xs text-slate-500">Avg Spent/Trip</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data?.topCountries?.length || 0}</p>
              <p className="text-xs text-slate-500">Countries Visited</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data?.travelerDistribution?.reduce((s, t) => s + t.count, 0) || 0}</p>
              <p className="text-xs text-slate-500">Total Trips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Registration Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-bold text-slate-900">User Registrations (12 Months)</h3>
          </div>
          <canvas ref={regRef} className="w-full" />
        </div>

        {/* Trip Creation Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900">Trips Created (12 Months)</h3>
          </div>
          <canvas ref={tripRef} className="w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Top Countries</h3>
          </div>
          {data?.topCountries?.length > 0 ? (
            <div className="space-y-3">
              {data.topCountries.map((c, i) => {
                const maxTrips = data.topCountries[0]?.trips || 1;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{c.country || 'Unknown'}</span>
                      <span className="text-xs font-bold text-slate-900">{c.trips} trips</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                        style={{ width: `${(c.trips / maxTrips) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No country data</p>
          )}
        </div>

        {/* Trip Duration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-purple-500" />
            <h3 className="text-base font-bold text-slate-900">Trip Duration Distribution</h3>
          </div>
          {data?.durationDistribution?.length > 0 ? (
            <div className="space-y-3">
              {data.durationDistribution.map((d, i) => {
                const max = Math.max(...data.durationDistribution.map(x => x.count));
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500'];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{d.range}</span>
                      <span className="text-xs font-bold text-slate-900">{d.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-500`}
                        style={{ width: `${(d.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No data</p>
          )}
        </div>

        {/* Traveler Count */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-bold text-slate-900">Group Size Distribution</h3>
          </div>
          {data?.travelerDistribution?.length > 0 ? (
            <div className="space-y-3">
              {data.travelerDistribution.map((t, i) => {
                const max = Math.max(...data.travelerDistribution.map(x => x.count));
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{t.travelers} traveler{t.travelers !== 1 ? 's' : ''}</span>
                      <span className="text-xs font-bold text-slate-900">{t.count} trips</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                        style={{ width: `${(t.count / max) * 100}%` }} />
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
  );
};

export default AdminAnalytics;
