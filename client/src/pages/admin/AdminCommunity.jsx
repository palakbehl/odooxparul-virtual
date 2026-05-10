import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { MessageCircle, Loader2, Search, Trash2, Eye, Flag, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [viewPost, setViewPost] = useState(null);

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getCommunityPosts({ page, limit: 15, search });
      if (data.success) { setPosts(data.posts); setPagination(data.pagination); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try { await adminAPI.deleteCommunityPost(id); setPosts(ps => ps.filter(p => p._id !== id)); if (viewPost?._id === id) setViewPost(null); } catch (e) { console.error(e); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };
  const timeAgo = (d) => { const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`; };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display text-slate-900">Community Moderation</h1><p className="text-slate-500 mt-1 text-sm">Review and moderate community posts</p></div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-3 py-2.5 mb-6 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="flex-1 text-sm bg-transparent outline-none" />
      </form>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center"><p className="text-xl font-bold text-slate-900">{pagination.total || 0}</p><p className="text-[10px] text-slate-400">Total Posts</p></div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center"><p className="text-xl font-bold text-emerald-700">{posts.filter(p => p.likes?.length > 2).length}</p><p className="text-[10px] text-slate-400">Popular</p></div>
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-center"><p className="text-xl font-bold text-amber-700">{posts.filter(p => p.isPublic === false).length}</p><p className="text-[10px] text-slate-400">Flagged</p></div>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-600 animate-spin" /></div> :
        posts.length === 0 ? <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center"><MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No community posts found</p></div> :
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post._id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {post.user?.firstName?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-900">{post.user?.firstName} {post.user?.lastName}</p>
                      <span className="text-[10px] text-slate-400">{post.user?.email}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{timeAgo(post.createdAt)}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-1">{post.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{post.content}</p>
                    {post.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{post.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600">{t}</span>)}</div>}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Heart className="w-3 h-3" />{post.likes?.length || 0}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><MessageCircle className="w-3 h-3" />{post.comments?.length || 0}</span>
                      <div className="flex gap-1 ml-auto">
                        <button onClick={() => setViewPost(post)} className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-semibold text-slate-600 hover:bg-slate-100"><Eye className="w-3 h-3 inline mr-1" />View</button>
                        <button onClick={() => handleDelete(post._id)} className="px-3 py-1.5 bg-red-50 rounded-lg text-[10px] font-semibold text-red-600 hover:bg-red-100"><Trash2 className="w-3 h-3 inline mr-1" />Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {pagination.pages > 1 && <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400">Page {page} of {pagination.pages}</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>}
          </div>}

      {/* View Post Modal */}
      {viewPost && (<>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setViewPost(null)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold">Post Details</h3>
              <button onClick={() => setViewPost(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">{viewPost.user?.firstName?.[0]}</div>
                <div><p className="text-sm font-bold">{viewPost.user?.firstName} {viewPost.user?.lastName}</p><p className="text-xs text-slate-400">{viewPost.user?.email} · {timeAgo(viewPost.createdAt)}</p></div>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{viewPost.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{viewPost.content}</p>
              {viewPost.tags?.length > 0 && <div className="flex flex-wrap gap-1.5 mb-4">{viewPost.tags.map((t, i) => <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">#{t}</span>)}</div>}
              <div className="flex items-center gap-4 text-sm text-slate-500"><Heart className="w-4 h-4" />{viewPost.likes?.length || 0} likes<MessageCircle className="w-4 h-4 ml-2" />{viewPost.comments?.length || 0} comments</div>
              {viewPost.comments?.length > 0 && <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {viewPost.comments.map((c, i) => <div key={i} className="bg-slate-50 rounded-xl p-3"><p className="text-xs font-bold text-slate-700">{c.user?.firstName} {c.user?.lastName}</p><p className="text-xs text-slate-500 mt-0.5">{c.content}</p></div>)}
              </div>}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
              <button onClick={() => setViewPost(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl">Close</button>
              <button onClick={() => { handleDelete(viewPost._id); }} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"><Trash2 className="w-3.5 h-3.5 inline mr-1" />Remove Post</button>
            </div>
          </div>
        </div>
      </>)}
    </div>
  );
};

export default AdminCommunity;
