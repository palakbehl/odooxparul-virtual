import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, authAPI } from '../../services/api';
import {
  User, Mail, Shield, Calendar, Camera, Save, Loader2, CheckCircle,
  Users, Flag, MessageCircle, Globe, BarChart3, Activity,
  Lock, Smartphone, Key, Eye
} from 'lucide-react';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', bio: user?.bio || '', profileImage: user?.profileImage || ''
  });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try { const { data } = await adminAPI.getStats(); if (data.success) setStats(data.stats); } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      if (data.success) { updateUser(data.user); setSuccess(true); setEditing(false); setTimeout(() => setSuccess(false), 3000); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, profileImage: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

  const ACTIONS = [
    { action: 'Reviewed flagged community post', time: '2 hours ago', icon: Flag, color: 'text-amber-500' },
    { action: 'Updated user role to moderator', time: '5 hours ago', icon: Users, color: 'text-blue-500' },
    { action: 'Approved featured destination', time: '1 day ago', icon: Globe, color: 'text-emerald-500' },
    { action: 'Resolved spam report', time: '1 day ago', icon: Shield, color: 'text-purple-500' },
    { action: 'Monitored system health check', time: '2 days ago', icon: Activity, color: 'text-primary-500' },
  ];

  const PERMISSIONS = [
    { label: 'User Management', desc: 'Create, suspend, and manage user accounts', icon: Users, active: true },
    { label: 'Community Moderation', desc: 'Review and moderate community posts', icon: MessageCircle, active: true },
    { label: 'Analytics Access', desc: 'View platform analytics and trends', icon: BarChart3, active: true },
    { label: 'Destination Management', desc: 'Manage featured destinations and places', icon: Globe, active: true },
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-br from-slate-800 via-slate-700 to-primary-900 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="relative">
              {form.profileImage || user?.profileImage ?
                <img src={form.profileImage || user?.profileImage} alt="" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" /> :
                <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-primary-700 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white text-2xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                </div>}
              {editing && <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary-700">
                <Camera className="w-3.5 h-3.5 text-white" /><input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user?.firstName} {user?.lastName}</h1>
                <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-[10px] font-bold uppercase flex items-center gap-1"><Shield className="w-3 h-3" />Admin</span>
              </div>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-0.5">Member since {memberSince}</p>
            </div>
            <button onClick={() => setEditing(!editing)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2 mb-4"><CheckCircle className="w-4 h-4" />Profile updated!</div>}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Admin Activity Stats */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary-600" />Admin Activity</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-xl"><p className="text-xl font-bold text-slate-900">{stats?.totalUsers || 0}</p><p className="text-[10px] text-slate-400 mt-0.5">Users Managed</p></div>
              <div className="text-center p-3 bg-slate-50 rounded-xl"><p className="text-xl font-bold text-slate-900">{stats?.totalTrips || 0}</p><p className="text-[10px] text-slate-400 mt-0.5">Trips Monitored</p></div>
              <div className="text-center p-3 bg-slate-50 rounded-xl"><p className="text-xl font-bold text-slate-900">{stats?.activeUsers || 0}</p><p className="text-[10px] text-slate-400 mt-0.5">Active Users</p></div>
              <div className="text-center p-3 bg-slate-50 rounded-xl"><p className="text-xl font-bold text-slate-900">{stats?.newUsers || 0}</p><p className="text-[10px] text-slate-400 mt-0.5">New Users (30d)</p></div>
            </div>
          </div>

          {/* Recent Admin Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Actions</h3>
            <div className="space-y-3">
              {ACTIONS.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center ${a.color}`}><a.icon className="w-4 h-4" /></div>
                  <div className="flex-1"><p className="text-sm font-medium text-slate-700">{a.action}</p><p className="text-[10px] text-slate-400">{a.time}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Edit Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-slate-600 mb-1 block">First Name</label><input name="firstName" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-slate-600 mb-1 block">Last Name</label><input name="lastName" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
              </div>
              <div><label className="text-xs font-medium text-slate-600 mb-1 block">Bio</label><textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none" /></div>
              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Admin Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Account Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{user?.email}</span></div>
              <div className="flex items-center gap-3"><Shield className="w-4 h-4 text-primary-500" /><span className="text-slate-600 capitalize">{user?.role} Account</span></div>
              <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-slate-400" /><span className="text-slate-600">Joined {memberSince}</span></div>
              <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600 font-medium">Active</span></div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Lock className="w-4 h-4 text-slate-400" />Security</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-600 hover:bg-slate-100"><Key className="w-4 h-4 text-slate-400" />Change Password</button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-600 hover:bg-slate-100"><Smartphone className="w-4 h-4 text-slate-400" />Enable 2FA</button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-600 hover:bg-slate-100"><Eye className="w-4 h-4 text-slate-400" />Login Activity</button>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Permissions</h3>
            <div className="space-y-2">
              {PERMISSIONS.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p.icon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-slate-800">{p.label}</p><p className="text-[10px] text-slate-400 truncate">{p.desc}</p></div>
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
