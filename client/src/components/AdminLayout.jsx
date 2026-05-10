import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Users, TrendingUp, Star, Map, Shield,
  User, Search, Bell, MessageCircle, ChevronDown, LogOut,
  Plane, Menu, X, Settings, BarChart3, Globe, Flag,
  Server, Activity
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Home },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Trips Management', path: '/admin/trips', icon: Map },
    { name: 'Community Moderation', path: '/admin/community', icon: MessageCircle },
    { name: 'Reports & Flags', path: '/admin/reports', icon: Flag },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Destinations', path: '/admin/destinations', icon: Globe },
    { name: 'Popular Activities', path: '/admin/activities', icon: Star },
    { name: 'System Monitoring', path: '/admin/system', icon: Server },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const bottomNavItems = [
    { name: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-full w-[240px] bg-white border-r border-slate-200/80 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2.5 px-6 h-[72px] border-b border-slate-100">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-600/20">
            <Plane className="w-4.5 h-4.5 text-white transform -rotate-45" />
          </div>
          <span className="text-lg font-bold font-display tracking-tight">
            Travel<span className="text-gradient">oop</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-xl">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold text-primary-700">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${active ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                  <item.icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="my-3 mx-3 h-px bg-slate-100" />
          <div className="space-y-0.5">
            {bottomNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${active ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                  <item.icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-[72px]">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500"><Menu className="w-5 h-5" /></button>
              <form className="hidden sm:flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search users, trips, destinations..." className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-transparent rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all" />
                </div>
              </form>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" /></button>
              <div className="relative ml-2">
                <button onClick={() => setProfileDropdown(!profileDropdown)} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50">
                  {user?.profileImage ? <img src={user.profileImage} alt="" className="w-8 h-8 rounded-xl object-cover ring-2 ring-slate-100" /> :
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-100">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>}
                  <span className="hidden sm:block text-sm font-semibold text-slate-700">{user?.firstName} {user?.lastName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>
                {profileDropdown && (<>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase">Admin</span>
                    </div>
                    <div className="p-1.5">
                      <Link to="/admin/profile" onClick={() => setProfileDropdown(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50"><User className="w-4 h-4" />Admin Profile</Link>
                      <Link to="/admin/settings" onClick={() => setProfileDropdown(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50"><Settings className="w-4 h-4" />Settings</Link>
                    </div>
                    <div className="p-1.5 border-t border-slate-100">
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 w-full"><LogOut className="w-4 h-4" />Log Out</button>
                    </div>
                  </div>
                </>)}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
