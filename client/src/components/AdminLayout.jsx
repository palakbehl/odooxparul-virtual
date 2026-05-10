// ==========================================
// Admin Dashboard Layout - Traveloop
// Sidebar + Top Bar for admin panel
// ==========================================

import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Users, TrendingUp, Star, DollarSign, CheckSquare,
  User, Search, Bell, MessageCircle, ChevronDown, LogOut,
  Plane, Menu, X, Settings, BarChart3, Map
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { name: 'Home', path: '/admin', icon: Home },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Popular Activities', path: '/admin/activities', icon: Star },
    { name: 'User Trends & Analytics', path: '/admin/analytics', icon: TrendingUp },
    { name: 'Budget', path: '/admin/budget', icon: DollarSign },
    { name: 'Checklist', path: '/admin/checklist', icon: CheckSquare },
  ];

  const bottomNavItems = [
    { name: 'Profile', path: '/admin/profile', icon: User },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed top-0 left-0 h-full w-[240px] bg-white border-r border-slate-200/80 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 h-[72px] border-b border-slate-100">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-600/20">
            <Plane className="w-4.5 h-4.5 text-white transform -rotate-45" />
          </div>
          <span className="text-lg font-bold font-display tracking-tight">
            Travel<span className="text-gradient">oop</span>
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group ${active
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <item.icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
                    }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-4 mx-3 h-px bg-slate-100" />

          {/* Bottom Nav */}
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group ${active
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <item.icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
                    }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        {/* Sidebar Footer - App Promo */}
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-[72px]">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            {/* Left - Mobile Menu + Search */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <form className="hidden sm:flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users, trips, destinations..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-transparent rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
              </form>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {/* Messages */}
              <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.firstName}
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-100">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-semibold text-slate-700">{user?.firstName} {user?.lastName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown */}
                {profileDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase">Admin</span>
                      </div>
                      <div className="p-1.5">
                        <Link
                          to="/admin/profile"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Map className="w-4 h-4" />
                          User Dashboard
                        </Link>
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="p-1.5 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
