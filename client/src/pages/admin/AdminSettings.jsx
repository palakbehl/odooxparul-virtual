import { useState } from 'react';
import { Settings, Shield, Bell, Globe, Database, Key, Save, CheckCircle, Mail, Server } from 'lucide-react';

const AdminSettings = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Traveloop',
    supportEmail: 'support@traveloop.com',
    maxTripsPerUser: 50,
    maxPostsPerDay: 10,
    enableRegistration: true,
    enableCommunity: true,
    maintenanceMode: false,
    requireEmailVerification: false,
    defaultCurrency: 'INR',
    apiRateLimit: 100,
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };
  const toggle = (key) => setSettings({ ...settings, [key]: !settings[key] });

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold font-display text-slate-900">Settings</h1><p className="text-slate-500 mt-1 text-sm">Platform configuration and preferences</p></div>

      {saved && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2 mb-4"><CheckCircle className="w-4 h-4" />Settings saved!</div>}

      {/* General */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-primary-600" />General</h3>
        <div className="space-y-4">
          <div><label className="text-xs font-medium text-slate-600 mb-1 block">Site Name</label><input value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          <div><label className="text-xs font-medium text-slate-600 mb-1 block">Support Email</label><input value={settings.supportEmail} onChange={e => setSettings({ ...settings, supportEmail: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-slate-600 mb-1 block">Default Currency</label><select value={settings.defaultCurrency} onChange={e => setSettings({ ...settings, defaultCurrency: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"><option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option></select></div>
            <div><label className="text-xs font-medium text-slate-600 mb-1 block">API Rate Limit (req/min)</label><input type="number" value={settings.apiRateLimit} onChange={e => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          </div>
        </div>
      </div>

      {/* Limits */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-primary-600" />Limits</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs font-medium text-slate-600 mb-1 block">Max Trips per User</label><input type="number" value={settings.maxTripsPerUser} onChange={e => setSettings({ ...settings, maxTripsPerUser: parseInt(e.target.value) })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          <div><label className="text-xs font-medium text-slate-600 mb-1 block">Max Posts per Day</label><input type="number" value={settings.maxPostsPerDay} onChange={e => setSettings({ ...settings, maxPostsPerDay: parseInt(e.target.value) })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
        </div>
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-600" />Features & Security</h3>
        <div className="space-y-3">
          {[
            { key: 'enableRegistration', label: 'Allow New Registrations', desc: 'Users can create new accounts', icon: Key },
            { key: 'enableCommunity', label: 'Community Module', desc: 'Enable community posts and interactions', icon: Globe },
            { key: 'requireEmailVerification', label: 'Email Verification', desc: 'Require email verification on signup', icon: Mail },
            { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to users', icon: Server },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-slate-400" />
                <div><p className="text-sm font-medium text-slate-700">{item.label}</p><p className="text-[10px] text-slate-400">{item.desc}</p></div>
              </div>
              <button onClick={() => toggle(item.key)} className={`w-11 h-6 rounded-full transition-colors relative ${settings[item.key] ? 'bg-primary-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700"><Save className="w-4 h-4" />Save Settings</button>
      </div>
    </div>
  );
};

export default AdminSettings;
