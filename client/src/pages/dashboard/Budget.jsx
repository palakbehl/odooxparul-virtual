// ==========================================
// Budget Page - Traveloop
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import {
  DollarSign, TrendingUp, TrendingDown, PieChart, Plus,
  Loader2, Wallet, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const Budget = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBudget: 0, totalSpent: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tripsRes, statsRes] = await Promise.all([
        tripAPI.getAll({ sort: '-startDate' }),
        tripAPI.getDashboardStats().catch(() => ({ data: { stats: {} } }))
      ]);
      if (tripsRes.data.success) setTrips(tripsRes.data.trips);
      if (statsRes.data.success) setStats(statsRes.data.stats || {});
    } catch (err) {
      console.error('Load budget error:', err);
    } finally {
      setLoading(false);
    }
  };

  const remaining = (stats.totalBudget || 0) - (stats.totalSpent || 0);
  const spentPercent = stats.totalBudget ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0;

  const statCards = [
    {
      label: 'Total Budget',
      value: `$${(stats.totalBudget || 0).toLocaleString()}`,
      icon: Wallet,
      color: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Total Spent',
      value: `$${(stats.totalSpent || 0).toLocaleString()}`,
      icon: ArrowUpRight,
      color: 'from-red-500 to-pink-500',
      bgLight: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      label: 'Remaining',
      value: `$${remaining.toLocaleString()}`,
      icon: ArrowDownRight,
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Budget</h1>
        <p className="text-slate-500 text-sm mt-1">Track your travel expenses</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const CardIcon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${card.bgLight} rounded-xl flex items-center justify-center`}>
                  <CardIcon className={`w-5 h-5 ${card.textColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Budget Overview</h3>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Overall Progress</span>
            <span className="text-sm font-semibold text-slate-700">{spentPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                spentPercent > 90 ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                spentPercent > 70 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              style={{ width: `${Math.min(spentPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Per-Trip Budgets */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Trip Budgets</h3>
        {trips.length > 0 ? (
          <div className="space-y-4">
            {trips.filter(t => t.budget?.total > 0).map(trip => {
              const spent = trip.budget?.spent || 0;
              const total = trip.budget?.total || 1;
              const pct = Math.round((spent / total) * 100);
              return (
                <div key={trip._id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Link to={`/dashboard/trips/${trip._id}`} className="text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors">
                      {trip.title}
                    </Link>
                    <span className="text-xs text-slate-500">
                      ${spent.toLocaleString()} / ${total.toLocaleString()} {trip.budget?.currency}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {trips.filter(t => t.budget?.total > 0).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No trips with budgets set</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Create trips with budgets to track expenses</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
