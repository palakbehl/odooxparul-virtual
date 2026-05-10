// ==========================================
// Admin Manage Users Page - Traveloop
// ==========================================

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Trash2, Shield, ShieldOff, Loader2, Users, MapPin,
  Calendar, Mail, MoreVertical
} from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [pagination.page, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery
      });
      if (data.success) {
        setUsers(data.users);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (err) {
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user and all their trips?')) return;
    try {
      await adminAPI.deleteUser(id);
      loadUsers();
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const handleToggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUserRole(id, newRole);
      loadUsers();
    } catch (err) {
      console.error('Update role error:', err);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold font-display text-slate-900 leading-tight">Manage Users</h1>
        <p className="text-slate-500 text-sm mt-1">View and manage all registered users on Traveloop.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pagination.total}</p>
              <p className="text-xs text-slate-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-xs text-slate-500">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{users.reduce((sum, u) => sum + (u.tripCount || 0), 0)}</p>
              <p className="text-xs text-slate-500">Total Trips</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{users.filter(u => {
                const d = new Date(u.createdAt);
                const now = new Date();
                return (now - d) < 7 * 24 * 60 * 60 * 1000;
              }).length}</p>
              <p className="text-xs text-slate-500">New This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 border border-slate-200 rounded-2xl mb-6">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm placeholder-slate-400 focus:outline-none border-none"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50">
            <Filter className="w-4 h-4 text-slate-500" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50">
            Sort by
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No users found</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">User</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1">Role</div>
              <div className="col-span-1">Trips</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Rows */}
            {users.map((u) => (
              <div key={u._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center">
                {/* User */}
                <div className="col-span-4 flex items-center gap-3">
                  {u.profileImage ? (
                    <img src={u.profileImage} alt={u.firstName} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">{u.city && u.country ? `${u.city}, ${u.country}` : u.city || u.country || '—'}</p>
                </div>

                {/* Role */}
                <div className="col-span-1">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    u.role === 'admin' ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {u.role}
                  </span>
                </div>

                {/* Trips */}
                <div className="col-span-1">
                  <p className="text-sm font-semibold text-slate-700">{u.tripCount || 0}</p>
                </div>

                {/* Joined */}
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">{formatDate(u.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2 relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === u._id ? null : u._id)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenu === u._id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
                        <button
                          onClick={() => { handleToggleRole(u._id, u.role); setActiveMenu(null); }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          {u.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => { handleDelete(u._id); setActiveMenu(null); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} users)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
