import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI, tripAPI } from '../../services/api';
import {
  User, Mail, Phone, MapPin, Globe, FileText, Camera,
  Save, Loader2, CheckCircle, Calendar, Map, Edit3,
  ChevronRight, ArrowRight, MoreHorizontal, Plane
} from 'lucide-react';

const COVERS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
  'https://images.unsplash.com/photo-1523906834658-6e147245754?w=400&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80',
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
  });

  useEffect(() => { loadTrips(); }, []);

  const loadTrips = async () => {
    try {
      const { data } = await tripAPI.getAll({});
      if (data.success) setTrips(data.trips);
    } catch (e) { console.error(e); }
    finally { setTripsLoading(false); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); setSuccess(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, profileImage: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await authAPI.updateProfile(formData);
      if (data.success) {
        updateUser(data.user);
        setSuccess(true); setEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  // Dynamic stats
  const totalTrips = trips.length;
  const allDests = trips.flatMap(t => t.destinations || []);
  const uniqueCountries = new Set(allDests.map(d => d.country).filter(Boolean)).size;
  const totalCities = allDests.length;
  const totalDays = trips.reduce((s, t) => {
    if (t.startDate && t.endDate) {
      return s + Math.max(0, Math.ceil((new Date(t.endDate) - new Date(t.startDate)) / 86400000));
    }
    return s;
  }, 0);

  const upcomingTrips = trips.filter(t => ['draft', 'upcoming', 'active'].includes(t.status));
  const completedTrips = trips.filter(t => t.status === 'completed');

  const TripCard = ({ trip, idx }) => {
    const cover = trip.coverImage || (trip.destinations?.[0]?.image) || COVERS[idx % COVERS.length];
    const statusColor = trip.status === 'completed' ? 'bg-emerald-500' : trip.status === 'active' ? 'bg-blue-500' : 'bg-primary-600';
    const statusLabel = trip.status === 'completed' ? 'COMPLETED' : trip.status === 'active' ? 'ONGOING' : 'UPCOMING';

    return (
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-36">
          <img src={cover} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <span className={`absolute top-3 left-3 px-2.5 py-1 ${statusColor} text-white text-[9px] font-bold tracking-wider rounded-full uppercase`}>{statusLabel}</span>
          <button className="absolute top-3 right-3 p-1.5 bg-white/70 rounded-full hover:bg-white"><MoreHorizontal className="w-3.5 h-3.5 text-slate-600" /></button>
        </div>
        <div className="p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-1">{trip.title}</h4>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" />{fmt(trip.startDate)} – {fmt(trip.endDate)}</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.destinations?.length || 0} Destination{(trip.destinations?.length || 0) !== 1 ? 's' : ''}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
            <div className="flex -space-x-1.5">
              {[0, 1].map(i => <img key={i} src={`https://i.pravatar.cc/40?img=${i + 10 + idx}`} alt="" className="w-7 h-7 rounded-full border-2 border-white" />)}
              {(trip.travelerCount || 1) > 2 && <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">+{(trip.travelerCount || 1) - 2}</div>}
            </div>
            <Link to={`/dashboard/itinerary?trip=${trip._id}`} className="flex items-center gap-1 px-3 py-1.5 border border-primary-200 text-primary-600 rounded-lg text-xs font-semibold hover:bg-primary-50">View <ArrowRight className="w-3 h-3" /></Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-36 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 relative">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14">
            <div className="relative">
              {formData.profileImage || user?.profileImage ? (
                <img src={formData.profileImage || user?.profileImage} alt={user?.firstName} className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white text-3xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center cursor-pointer shadow hover:bg-slate-50">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{user?.firstName} {user?.lastName}</h1>
                <Edit3 className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setEditing(!editing)} />
              </div>
              {(user?.city || user?.country) && (
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5 text-primary-500" />{[user?.city, user?.country].filter(Boolean).join(', ')}</p>
              )}
              {user?.bio && <p className="text-sm text-slate-500 mt-1">{user.bio}</p>}
            </div>
            <button onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Edit3 className="w-4 h-4" />{editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-4 divide-x divide-slate-100">
          <div className="text-center py-5"><p className="text-2xl font-bold text-slate-900">{totalTrips}</p><p className="text-xs text-slate-400 mt-0.5">Trips</p></div>
          <div className="text-center py-5"><p className="text-2xl font-bold text-slate-900">{uniqueCountries}</p><p className="text-xs text-slate-400 mt-0.5">Countries</p></div>
          <div className="text-center py-5"><p className="text-2xl font-bold text-slate-900">{totalCities}</p><p className="text-xs text-slate-400 mt-0.5">Cities</p></div>
          <div className="text-center py-5"><p className="text-2xl font-bold text-slate-900">{totalDays}</p><p className="text-xs text-slate-400 mt-0.5">Days Traveled</p></div>
        </div>
      </div>

      {/* Success/Error */}
      {success && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Profile updated!</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">⚠️ {error}</div>}

      {/* Edit Form */}
      {editing && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-600 mb-1.5">First Name</label><div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400" /></div></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1.5">Last Name</label><div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400" /></div></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="email" value={user?.email || ''} disabled className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500" /></div></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1.5">Phone</label><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400" /></div></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-600 mb-1.5">City</label><div className="relative"><MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Your city" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400" /></div></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1.5">Country</label><div className="relative"><Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Your country" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400" /></div></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1.5">Bio</label><textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Wanderer at heart 🌍 | Love exploring new places, cultures and cuisines." maxLength={200} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 resize-none" /></div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Preplanned Trips */}
      {upcomingTrips.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Plane className="w-5 h-5 text-primary-600 -rotate-45" />Preplanned Trips</h2>
            <Link to="/dashboard/trips" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTrips.slice(0, 3).map((t, i) => <TripCard key={t._id} trip={t} idx={i} />)}
          </div>
        </div>
      )}

      {/* Previous Trips */}
      {completedTrips.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Map className="w-5 h-5 text-emerald-600" />Previous Trips</h2>
            <Link to="/dashboard/trips" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTrips.slice(0, 3).map((t, i) => <TripCard key={t._id} trip={t} idx={i + 3} />)}
          </div>
        </div>
      )}

      {/* Show all trips if none are specifically completed */}
      {completedTrips.length === 0 && upcomingTrips.length === 0 && trips.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Map className="w-5 h-5 text-primary-600" />Your Trips</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.slice(0, 6).map((t, i) => <TripCard key={t._id} trip={t} idx={i} />)}
          </div>
        </div>
      )}

      {/* No trips */}
      {trips.length === 0 && !tripsLoading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Plane className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No trips yet</h3>
          <p className="text-sm text-slate-500 mb-4">Start planning to see your trips here!</p>
          <Link to="/dashboard/trips/new" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm">Plan a Trip</Link>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Account Details</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /><span className="text-sm text-slate-600">Email</span></div>
            <span className="text-sm font-medium text-slate-900">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-slate-400" /><span className="text-sm text-slate-600">Member since</span></div>
            <span className="text-sm font-medium text-slate-900">{memberSince}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3"><Map className="w-4 h-4 text-slate-400" /><span className="text-sm text-slate-600">Total Trips</span></div>
            <span className="text-sm font-bold text-primary-600">{totalTrips}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
