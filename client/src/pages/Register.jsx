// ==========================================
// Register Page - Traveloop
// Inspired by reference Screen 2
// ==========================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import {
  User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Globe, FileText,
  Camera, Plane, UserPlus, ArrowLeft, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Germany',
  'France', 'Japan', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands',
  'South Korea', 'Singapore', 'Thailand', 'Indonesia', 'Malaysia', 'UAE',
  'South Africa', 'New Zealand', 'Sweden', 'Norway', 'Denmark', 'Switzerland',
  'Portugal', 'Ireland', 'Philippines', 'Vietnam', 'Turkey', 'Other'
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    city: '', country: '', bio: '', password: '', confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, profileImage: profileImage || '' };
      delete payload.confirmPassword;
      const { data } = await authAPI.register(payload);
      if (data.success) {
        localStorage.setItem('traveloop_token', data.token);
        localStorage.setItem('traveloop_user', JSON.stringify(data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon: Icon, label, name, type = 'text', placeholder, half = false, required = false }) => (
    <div className={half ? '' : 'col-span-2'}>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
        <input
          id={`register-${name}`}
          type={type === 'password' ? ((name === 'password' ? showPassword : showConfirm) ? 'text' : 'password') : type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-11 pr-${type === 'password' ? '11' : '4'} py-3 bg-white border ${errors[name] ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'} rounded-xl text-slate-900 placeholder-slate-400 focus:ring-4 transition-all text-sm`}
        />
        {type === 'password' && (
          <button type="button" onClick={() => name === 'password' ? setShowPassword(!showPassword) : setShowConfirm(!showConfirm)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {(name === 'password' ? showPassword : showConfirm) ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        )}
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Travel Image (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80")' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-900/80 via-primary-800/60 to-primary-900/80" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-400/15 rounded-full blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl xl:text-4xl font-bold font-display text-white mb-4">
              Start Your Journey
            </h2>
            <p className="text-white/70 text-lg max-w-md leading-relaxed mb-12">
              Create your account and join a global community of passionate travelers.
            </p>
            {/* Feature cards */}
            <div className="space-y-4 w-full max-w-sm">
              {[
                { icon: MapPin, title: 'Plan with Ease', desc: 'Create personalized itineraries in minutes' },
                { icon: Globe, title: 'Travel Smart', desc: 'Stay on budget with smart planning' },
                { icon: UserPlus, title: 'Share & Inspire', desc: 'Share your trips and inspire others' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-white/60 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div />
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in py-4">
          {/* Mobile back link */}
          <Link to="/" className="lg:hidden flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl shadow-lg shadow-primary-600/25 mb-4">
              <Plane className="w-7 h-7 text-white transform -rotate-45" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mb-1">Create Your Account</h1>
            <p className="text-slate-500 text-sm">Join Traveloop and start your journey with us</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <InputField icon={User} label="First Name" name="firstName" placeholder="First Name" half required />
              <InputField icon={User} label="Last Name" name="lastName" placeholder="Last Name" half required />
              <InputField icon={Mail} label="Email Address" name="email" type="email" placeholder="you@example.com" required />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input id="register-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input id="register-city" type="text" name="city" value={formData.city} onChange={handleChange}
                    placeholder="Your City"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <select id="register-country" name="country" value={formData.country} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm appearance-none cursor-pointer">
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <InputField icon={Lock} label="Password" name="password" type="password" placeholder="Min 6 characters" half required />
              <InputField icon={Lock} label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm password" half required />

              {/* Bio */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Additional Information <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <textarea
                    id="register-bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself..."
                    maxLength={200}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none text-sm"
                  />
                  <span className="absolute bottom-2.5 right-3.5 text-xs text-slate-400">{formData.bio.length}/200</span>
                </div>
              </div>

              {/* Profile Image */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Profile Photo <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-200" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
                        <Camera className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                      <Camera className="w-4 h-4" />
                      {imagePreview ? 'Change Photo' : 'Upload Photo'}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG. Max 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-600/25 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          {/* Login redirect */}
          <p className="text-center mt-6 text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
