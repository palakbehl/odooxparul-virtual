// ==========================================
// Community Page - Traveloop
// A complete social travel sharing platform
// ==========================================

import { useState, useEffect } from 'react';
import { communityAPI, tripAPI } from '../../services/api';
import {
  Heart, MessageCircle, Bookmark, Share2, Copy, MapPin, 
  Search, TrendingUp, Users, Plus, X, Image as ImageIcon,
  MoreHorizontal, ChevronRight, Loader2, Globe, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Community = () => {
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showComments, setShowComments] = useState(null); // stores postId
  const [commentsData, setCommentsData] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Create Post State
  const [newPost, setNewPost] = useState({ title: '', description: '', images: '', tripId: '', visibility: 'public' });
  const [myTrips, setMyTrips] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth User
  const userStr = localStorage.getItem('traveloop_user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    loadCommunityData();
    if (currentUser) {
      tripAPI.getAll({ limit: 50 }).then(res => {
        if (res.data.success) setMyTrips(res.data.trips);
      }).catch(console.error);
    }
  }, []);

  const loadCommunityData = async (searchQuery = '') => {
    setLoading(true);
    try {
      const [feedRes, trendRes] = await Promise.all([
        communityAPI.getFeed({ search: searchQuery }),
        communityAPI.getTrending()
      ]);
      if (feedRes.data.success) setFeed(feedRes.data.posts);
      if (trendRes.data.success) {
        setTrendingTags(trendRes.data.hashtags);
        setTopUsers(trendRes.data.topUsers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') loadCommunityData(search);
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.description) return;
    setIsSubmitting(true);
    try {
      const payload = { ...newPost, images: newPost.images ? newPost.images.split(',').map(s => s.trim()) : [] };
      const res = await communityAPI.createPost(payload);
      if (res.data.success) {
        setFeed([res.data.post, ...feed]);
        setShowCreate(false);
        setNewPost({ title: '', description: '', images: '', tripId: '', visibility: 'public' });
      }
    } catch (e) {
      console.error('Create post failed', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId, idx) => {
    if (!currentUser) return alert('Please login to like');
    try {
      const res = await communityAPI.likePost(postId);
      if (res.data.success) {
        const newFeed = [...feed];
        newFeed[idx].likesCount = res.data.likesCount;
        setFeed(newFeed);
      }
    } catch (e) { console.error(e); }
  };

  const handleSave = async (postId, idx) => {
    if (!currentUser) return alert('Please login to save');
    try {
      const res = await communityAPI.savePost(postId);
      if (res.data.success) {
        const newFeed = [...feed];
        newFeed[idx].savesCount = res.data.savesCount;
        setFeed(newFeed);
      }
    } catch (e) { console.error(e); }
  };

  const handleCopyItinerary = async (tripId) => {
    if (!currentUser) return alert('Please login to copy itineraries');
    if (!window.confirm('Copy this itinerary to your account?')) return;
    try {
      const res = await communityAPI.copyItinerary(tripId);
      if (res.data.success) {
        alert('Itinerary copied! You can now edit it in your Trips.');
        navigate(`/dashboard/itinerary?trip=${res.data.tripId}`);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to copy itinerary');
    }
  };

  const loadComments = async (postId) => {
    setShowComments(postId);
    try {
      const res = await communityAPI.getPost(postId);
      if (res.data.success) {
        setCommentsData(res.data.comments || []);
      }
    } catch (e) { console.error(e); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    try {
      const res = await communityAPI.comment(showComments, newComment);
      if (res.data.success) {
        setCommentsData([res.data.comment, ...commentsData]);
        setNewComment('');
        // Update feed comment count
        setFeed(feed.map(p => p._id === showComments ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      }
    } catch (e) { console.error(e); }
  };

  const handleFollow = async (targetId) => {
    if (!currentUser) return alert('Please login to follow users');
    try {
      const res = await communityAPI.followUser(targetId);
      if (res.data.success) {
        setTopUsers(topUsers.map(u => 
          u._id === targetId ? { ...u, isFollowing: res.data.following } : u
        ));
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 animate-fade-in">
      
      {/* Community Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary-600" />
            Traveloop Community
          </h1>
          <p className="text-slate-500 mt-1">Discover, share, and copy amazing itineraries from travelers worldwide.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
              placeholder="Search destinations, tags..."
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary-400 outline-none w-full md:w-64"
            />
          </div>
          {currentUser && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" /> Share Trip
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar - Profile & Nav */}
        <div className="hidden lg:block space-y-6">
          {currentUser ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg">
                  {currentUser.firstName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{currentUser.firstName} {currentUser.lastName}</h3>
                  <p className="text-xs text-slate-500">Explorer</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-100 pt-4">
                <div>
                  <p className="text-lg font-bold text-slate-800">{currentUser.followersCount || 0}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Followers</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{currentUser.tripsShared || 0}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Trips</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-6 text-white text-center shadow-md">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-80" />
              <h3 className="font-bold mb-2">Join the Community</h3>
              <p className="text-sm text-white/80 mb-4">Share your travels, copy itineraries, and connect with explorers.</p>
              <button onClick={() => navigate('/login')} className="w-full py-2 bg-white text-primary-700 font-semibold rounded-xl text-sm">
                Log In
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingTags.length > 0 ? trendingTags.map((tag, i) => (
                <span key={i} onClick={() => { setSearch(tag.name); loadCommunityData(tag.name); }} 
                  className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg text-xs font-medium cursor-pointer hover:bg-primary-50 hover:text-primary-600 transition-colors">
                  #{tag.name}
                </span>
              )) : (
                <p className="text-xs text-slate-400">No trending tags yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Center Feed */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
          ) : feed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <Globe className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No posts found</h3>
              <p className="text-slate-500 text-sm">Be the first to share your travel story!</p>
            </div>
          ) : (
            feed.map((post, idx) => (
              <div key={post._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {post.userId?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {post.userId?.firstName} {post.userId?.lastName}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap">{post.description}</p>
                  
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.hashtags.map(tag => (
                        <span key={tag} className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Images */}
                  {post.images?.length > 0 && (
                    <div className="mb-4 rounded-xl overflow-hidden max-h-96">
                      <img src={post.images[0]} alt="Post media" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                    </div>
                  )}

                  {/* Embedded Itinerary Card */}
                  {post.tripId && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-2 flex items-center justify-between group">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 mb-1 uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5" /> Public Itinerary
                        </div>
                        <h4 className="font-bold text-slate-900">{post.tripId.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {post.tripId.duration || 1} Days • {post.destinations?.map(d=>d.name).join(', ') || 'Multiple Destinations'}
                        </p>
                      </div>
                      <button onClick={() => handleCopyItinerary(post.tripId._id)}
                        className="px-4 py-2 bg-white border border-slate-200 shadow-sm text-slate-700 rounded-lg text-sm font-semibold hover:border-primary-300 hover:text-primary-600 transition-all flex items-center gap-2">
                        <Copy className="w-4 h-4" /> Copy
                      </button>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-6">
                  <button onClick={() => handleLike(post._id, idx)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" /> {post.likesCount || 0}
                  </button>
                  <button onClick={() => loadComments(post._id)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" /> {post.commentsCount || 0}
                  </button>
                  <button onClick={() => handleSave(post._id, idx)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-amber-500 transition-colors ml-auto">
                    <Bookmark className="w-5 h-5" /> {post.savesCount || 0}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Sidebar - Top Users */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Top Explorers
            </h3>
            <div className="space-y-4">
              {topUsers.length > 0 ? topUsers.map((user, i) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {user.firstName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-none">{user.firstName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{user.followersCount || 0} followers</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFollow(user._id)}
                    className={`p-1.5 rounded-md transition-colors ${user.isFollowing ? 'bg-emerald-100 text-emerald-700' : 'text-primary-600 bg-primary-50 hover:bg-primary-100'}`}
                  >
                    {user.isFollowing ? <Globe className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )) : (
                <p className="text-xs text-slate-400">No active users yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE POST MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900">Create Community Post</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <input 
                  value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})}
                  placeholder="Give your post a catchy title..."
                  className="w-full text-lg font-bold text-slate-900 placeholder:text-slate-300 outline-none"
                />
              </div>
              <div>
                <textarea 
                  value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})}
                  placeholder="Share your travel story, tips, or describe your itinerary. Use #hashtags!"
                  className="w-full h-32 resize-none text-sm text-slate-600 placeholder:text-slate-400 outline-none"
                />
              </div>
              <div className="pt-3 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Attach Image URL</label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <input 
                    value={newPost.images} onChange={e => setNewPost({...newPost, images: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 text-sm outline-none bg-slate-50 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Share an Itinerary (Optional)</label>
                <select 
                  value={newPost.tripId} onChange={e => setNewPost({...newPost, tripId: e.target.value})}
                  className="w-full text-sm outline-none bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 text-slate-700"
                >
                  <option value="">-- Select a Trip to Share --</option>
                  {myTrips.map(t => <option key={t._id} value={t._id}>{t.title} ({new Date(t.startDate).toLocaleDateString()})</option>)}
                </select>
                {newPost.tripId && (
                  <p className="text-[10px] text-amber-600 mt-1.5 bg-amber-50 p-2 rounded flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> Note: This will make the selected itinerary Public.
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setShowCreate(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleCreatePost} disabled={isSubmitting || !newPost.title || !newPost.description} className="px-6 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Post to Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in flex flex-col max-h-[80vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Comments</h3>
              <button onClick={() => setShowComments(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {commentsData.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">No comments yet. Be the first!</p>
              ) : (
                commentsData.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">
                      {c.userId?.firstName?.[0] || 'U'}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl rounded-tl-none p-3">
                      <h5 className="text-xs font-bold text-slate-900">{c.userId?.firstName} {c.userId?.lastName}</h5>
                      <p className="text-sm text-slate-700 mt-1">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input 
                  value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:border-primary-400"
                />
                <button onClick={handleAddComment} disabled={!newComment.trim()} className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Community;
