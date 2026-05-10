// ==========================================
// Create Trip Page - Traveloop
// ==========================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import {
  ArrowLeft, MapPin, Calendar, DollarSign, Image, Plus,
  X, Loader2, Plane, CheckCircle
} from 'lucide-react';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    budget: { total: '', currency: 'USD' },
    isPublic: false,
  });
  const [destinations, setDestinations] = useState([{ name: '', country: '' }]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('budget.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, budget: { ...formData.budget, [field]: value } });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
    setError('');
  };

  const handleDestinationChange = (index, field, value) => {
    const updated = [...destinations];
    updated[index][field] = value;
    setDestinations(updated);
  };

  const addDestination = () => {
    setDestinations([...destinations, { name: '', country: '' }]);
  };

  const removeDestination = (index) => {
    if (destinations.length <= 1) return;
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Trip title is required'); return; }
    if (!formData.startDate) { setError('Start date is required'); return; }
    if (!formData.endDate) { setError('End date is required'); return; }
    if (!destinations[0].name.trim()) { setError('At least one destination is required'); return; }

    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        destinations: destinations.filter(d => d.name.trim()),
        budget: { ...formData.budget, total: Number(formData.budget.total) || 0 },
      };
      const { data } = await tripAPI.create(payload);
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard/trips'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const coverImages = [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80',
    'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=400&q=80',
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&q=80',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80',
  ];
  const [selectedCover, setSelectedCover] = useState('');

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Trip Created!</h2>
          <p className="text-slate-500">Redirecting to your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard/trips" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Plan a New Trip</h1>
          <p className="text-sm text-slate-500">Fill in the details for your next adventure</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Title */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary-500" /> Trip Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Trip Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Europe Getaway 2025"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your trip..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-8">
                  <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                  <span className="text-sm text-slate-600">Make trip public</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Destinations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" /> Destinations
          </h3>
          <div className="space-y-3">
            {destinations.map((dest, i) => (
              <div key={i} className="flex gap-3">
                <input
                  type="text"
                  value={dest.name}
                  onChange={(e) => handleDestinationChange(i, 'name', e.target.value)}
                  placeholder="City name *"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
                <input
                  type="text"
                  value={dest.country}
                  onChange={(e) => handleDestinationChange(i, 'country', e.target.value)}
                  placeholder="Country"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
                {destinations.length > 1 && (
                  <button type="button" onClick={() => removeDestination(i)} className="p-3 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDestination}
              className="flex items-center gap-2 px-4 py-2.5 text-primary-600 text-sm font-medium hover:bg-primary-50 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Destination
            </button>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" /> Budget
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Total Budget</label>
              <input
                type="number"
                name="budget.total"
                value={formData.budget.total}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Currency</label>
              <select
                name="budget.currency"
                value={formData.budget.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Image className="w-4 h-4 text-purple-500" /> Cover Image
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {coverImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedCover(img)}
                className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${selectedCover === img ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-slate-300'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                {selectedCover === img && (
                  <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/dashboard/trips" className="px-6 py-3 text-slate-600 font-medium text-sm hover:bg-slate-100 rounded-xl transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;
