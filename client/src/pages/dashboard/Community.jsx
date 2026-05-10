import{useState,useEffect}from'react';import{communityAPI}from'../../services/api';import{useAuth}from'../../context/AuthContext';import{Search,Plus,Heart,MessageCircle,Bookmark,MoreHorizontal,X,Loader2,TrendingUp,Award,Send,MapPin,Image}from'lucide-react';

const TRENDING=['#EuropeTravel','#JapanTrip','#BudgetTravel','#RoadTrip','#SoloTravel','#Backpacking','#FoodTravel'];
const CONTRIBUTORS=[
  {name:'Arjun Mehta',pts:'2.1K',avatar:'https://i.pravatar.cc/150?img=11'},
  {name:'Meera Iyer',pts:'1.8K',avatar:'https://i.pravatar.cc/150?img=5'},
  {name:'Rohan Sharma',pts:'1.6K',avatar:'https://i.pravatar.cc/150?img=12'},
  {name:'Priya Patel',pts:'1.4K',avatar:'https://i.pravatar.cc/150?img=9'},
  {name:'Kabir Singh',pts:'1.2K',avatar:'https://i.pravatar.cc/150?img=14'},
];

const DEMO_POSTS=[
  {_id:'d1',user:{firstName:'Arjun',lastName:'Mehta',avatar:'https://i.pravatar.cc/150?img=11'},title:'10 Days in Japan — Complete Budget Breakdown 🇯🇵',content:'Just got back from an amazing 10-day trip across Japan. Visited Tokyo, Kyoto, Osaka, and Nara. Total cost for 2 travelers was around ₹1.8L including flights. The JR Pass saved us so much money! Pro tip: eat at konbinis (convenience stores) for cheap but incredible meals. Highly recommend the 7-Eleven onigiri.',tags:['Japan','Budget','Itinerary','Asia'],likes:['u1','u2','u3','u4','u5'],comments:[{user:{firstName:'Meera',lastName:'Iyer'},content:'This is so helpful! How was the language barrier?'},{user:{firstName:'Rohan',lastName:'Sharma'},content:'JR Pass is a lifesaver! Used it last year too.'}],image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',createdAt:new Date(Date.now()-3600000*5)},
  {_id:'d2',user:{firstName:'Meera',lastName:'Iyer',avatar:'https://i.pravatar.cc/150?img=5'},title:'Hidden Gems of Rajasthan — Beyond Jaipur 🏰',content:'Everyone visits Jaipur and Udaipur, but Bundi and Pushkar blew my mind! Bundi has stunning step wells and zero crowds. Pushkar during non-festival season is incredibly peaceful. The local thali in Bundi was the best food of the entire trip.',tags:['India','Heritage','SoloTravel','Hidden Gems'],likes:['u1','u2','u3'],comments:[{user:{firstName:'Priya',lastName:'Patel'},content:'Bundi has been on my list forever! How many days did you spend there?'}],image:'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80',createdAt:new Date(Date.now()-3600000*18)},
  {_id:'d3',user:{firstName:'Rohan',lastName:'Sharma',avatar:'https://i.pravatar.cc/150?img=12'},title:'Bali on ₹50K — Yes, It\'s Possible! 🌴',content:'5 nights in Bali, Ubud + Seminyak, for under ₹50K per person (including flights from Mumbai). Stayed in beautiful guesthouses instead of resorts. Rented a scooter for ₹300/day. The rice terraces at Tegallalang were absolutely breathtaking at sunrise.',tags:['Bali','BudgetTravel','Beaches','Indonesia'],likes:['u1','u2','u3','u4','u5','u6','u7'],comments:[{user:{firstName:'Arjun',lastName:'Mehta'},content:'₹50K is incredible! Which airline did you fly?'},{user:{firstName:'Kabir',lastName:'Singh'},content:'Ubud is pure magic. The monkey forest is a must!'},{user:{firstName:'Meera',lastName:'Iyer'},content:'Adding this to my 2024 list 🙌'}],image:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',createdAt:new Date(Date.now()-3600000*36)},
  {_id:'d4',user:{firstName:'Priya',lastName:'Patel',avatar:'https://i.pravatar.cc/150?img=9'},title:'Switzerland Travel Guide — Interlaken, Lucerne, Zurich 🇨🇭',content:'The Swiss Travel Pass is expensive but worth every penny. Jungfraujoch (Top of Europe) was the highlight. Booked everything 3 months ahead and saved ~30% on trains. Tip: Carry your own water bottle, bottled water costs ₹300+ everywhere!',tags:['Switzerland','Europe','Mountains','Luxury'],likes:['u1','u2'],comments:[],image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',createdAt:new Date(Date.now()-3600000*72)},
  {_id:'d5',user:{firstName:'Kabir',lastName:'Singh',avatar:'https://i.pravatar.cc/150?img=14'},title:'Why You Should Visit Vietnam Before Everyone Else Does 🇻🇳',content:'Vietnam is seriously underrated. Ha Long Bay is as beautiful as any Thai island, Hoi An has the best street food in SE Asia, and Hanoi\'s Old Quarter is pure chaos in the best way. Budget: ₹2000-3000/day covers everything comfortably.',tags:['Vietnam','BudgetTravel','FoodTravel','Asia'],likes:['u1','u2','u3','u4'],comments:[{user:{firstName:'Rohan',lastName:'Sharma'},content:'Hoi An Banh Mi changed my life forever. Not joking.'}],image:'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80',createdAt:new Date(Date.now()-3600000*96)},
];

const Community=()=>{
const{user}=useAuth();
const[posts,setPosts]=useState([]);
const[loading,setLoading]=useState(true);
const[search,setSearch]=useState('');
const[showCreate,setShowCreate]=useState(false);
const[saving,setSaving]=useState(false);
const[form,setForm]=useState({title:'',content:'',tags:''});
const[commentText,setCommentText]=useState({});
const[expandComments,setExpandComments]=useState({});
const[activeTab,setActiveTab]=useState('For You');

useEffect(()=>{loadFeed();},[]);

const loadFeed=async(q)=>{setLoading(true);try{
  const{data}=await communityAPI.getFeed({search:q||search});
  if(data.success&&data.posts.length>0)setPosts(data.posts);
  else setPosts(DEMO_POSTS); // Show demo content when no DB posts
}catch(e){setPosts(DEMO_POSTS);}finally{setLoading(false);}};

const handleCreate=async()=>{if(!form.title.trim()||!form.content.trim())return;setSaving(true);try{
  const tags=form.tags.split(',').map(t=>t.trim()).filter(Boolean);
  await communityAPI.createPost({...form,tags,isPublic:true});
  await loadFeed();setShowCreate(false);setForm({title:'',content:'',tags:''});
}catch(e){console.error(e);}finally{setSaving(false);}};

const handleLike=async(id)=>{
  // Handle demo posts locally
  if(id.startsWith('d')){
    setPosts(ps=>ps.map(p=>p._id===id?{...p,likes:p.likes.includes('me')?p.likes.filter(l=>l!=='me'):[...p.likes,'me']}:p));
    return;
  }
  try{const{data}=await communityAPI.likePost(id);setPosts(ps=>ps.map(p=>p._id===id?{...p,likes:data.liked?[...p.likes,user._id||'me']:p.likes.filter(l=>l!==(user._id||'me'))}:p));}catch(e){console.error(e);}
};

const handleSave=async(id)=>{if(id.startsWith('d'))return;try{await communityAPI.savePost(id);}catch(e){console.error(e);}};

const handleComment=async(id)=>{
  const txt=commentText[id];if(!txt?.trim())return;
  if(id.startsWith('d')){
    setPosts(ps=>ps.map(p=>p._id===id?{...p,comments:[...p.comments,{user:{firstName:user?.firstName||'You',lastName:user?.lastName||''},content:txt}]}:p));
    setCommentText({...commentText,[id]:''});return;
  }
  try{const{data}=await communityAPI.comment(id,txt);setPosts(ps=>ps.map(p=>p._id===id?{...p,comments:data.comments}:p));setCommentText({...commentText,[id]:''});}catch(e){console.error(e);}
};

const timeAgo=(d)=>{const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return'just now';if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<3600*24)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`;};

const TABS=['For You','Trending','Following','Latest'];
const filtered=search?posts.filter(p=>p.title.toLowerCase().includes(search.toLowerCase())||p.content.toLowerCase().includes(search.toLowerCase())):posts;

return(
<div className="animate-fade-in max-w-5xl mx-auto">
<div className="mb-6"><h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Community</h1><p className="text-slate-500 mt-1">Share experiences, get inspired, and connect with travelers.</p></div>

{/* Tabs */}
<div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-4 overflow-x-auto">
{TABS.map(t=><button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeTab===t?'bg-primary-600 text-white shadow-sm':'text-slate-500 hover:bg-slate-50'}`}>{t}</button>)}
<div className="flex-1"/>
<button onClick={()=>setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700"><Plus className="w-4 h-4"/>New Post</button>
</div>

{/* Search */}
<div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3 mb-6">
<Search className="w-4 h-4 text-slate-400"/>
<input value={search} onChange={e=>{setSearch(e.target.value);}} placeholder="Search experiences, places, or users..." className="flex-1 text-sm bg-transparent outline-none placeholder-slate-400"/>
{search&&<button onClick={()=>setSearch('')}><X className="w-4 h-4 text-slate-400"/></button>}
</div>

<div className="grid lg:grid-cols-[1fr_300px] gap-6">
{/* Feed */}
<div className="space-y-5">
{loading?<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-600 animate-spin"/></div>:
filtered.map(post=>(
<div key={post._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
{/* Cover image */}
{post.image&&<img src={post.image} alt="" className="w-full h-48 object-cover"/>}
<div className="p-5">
{/* Author */}
<div className="flex items-center gap-3 mb-3">
{post.user?.avatar?<img src={post.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover"/>:
<div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{post.user?.firstName?.[0]||'U'}{post.user?.lastName?.[0]||''}</div>}
<div className="flex-1"><p className="text-sm font-bold text-slate-900">{post.user?.firstName} {post.user?.lastName}</p><p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p></div>
<button className="p-1.5 hover:bg-slate-100 rounded-lg"><MoreHorizontal className="w-4 h-4 text-slate-400"/></button>
</div>
{/* Content */}
<h3 className="text-base font-bold text-slate-900 mb-1.5">{post.title}</h3>
<p className="text-sm text-slate-600 mb-3 leading-relaxed">{post.content}</p>
{post.tags?.length>0&&<div className="flex flex-wrap gap-2 mb-3">{post.tags.map((t,i)=><span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">#{t}</span>)}</div>}
{/* Actions */}
<div className="flex items-center gap-5 pt-3 border-t border-slate-100">
<button onClick={()=>handleLike(post._id)} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${post.likes?.includes(user?._id)||post.likes?.includes('me')?'text-red-500':'text-slate-500 hover:text-red-500'}`}><Heart className={`w-4 h-4 ${post.likes?.includes(user?._id)||post.likes?.includes('me')?'fill-red-500':''}`}/>{post.likes?.length||0} Likes</button>
<button onClick={()=>setExpandComments({...expandComments,[post._id]:!expandComments[post._id]})} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600"><MessageCircle className="w-4 h-4"/>{post.comments?.length||0} Comments</button>
<button onClick={()=>handleSave(post._id)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600 ml-auto"><Bookmark className="w-4 h-4"/>Save</button>
</div>
{/* Comments */}
{expandComments[post._id]&&<div className="mt-3 pt-3 border-t border-slate-50 space-y-2.5">
{post.comments?.map((c,i)=><div key={i} className="flex items-start gap-2.5">
<div className="w-7 h-7 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{c.user?.firstName?.[0]||'U'}</div>
<div className="flex-1 bg-slate-50 rounded-xl px-3.5 py-2.5"><p className="text-xs font-bold text-slate-800">{c.user?.firstName} {c.user?.lastName}</p><p className="text-xs text-slate-600 mt-0.5">{c.content}</p></div>
</div>)}
<div className="flex items-center gap-2 mt-2"><input value={commentText[post._id]||''} onChange={e=>setCommentText({...commentText,[post._id]:e.target.value})} placeholder="Write a comment..." className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-400" onKeyDown={e=>e.key==='Enter'&&handleComment(post._id)}/><button onClick={()=>handleComment(post._id)} className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700"><Send className="w-3.5 h-3.5"/></button></div>
</div>}
</div>
</div>))}
</div>

{/* Sidebar */}
<div className="space-y-4">
{/* Create post card */}
<div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
<h3 className="text-sm font-bold mb-1">Share Your Journey ✈️</h3>
<p className="text-xs text-primary-100 mb-4">Your experience can inspire thousands of travelers!</p>
<button onClick={()=>setShowCreate(true)} className="w-full py-2.5 bg-white text-primary-700 rounded-xl text-sm font-bold hover:bg-primary-50 flex items-center justify-center gap-1.5"><Plus className="w-4 h-4"/>Create a Post</button>
</div>

{/* Trending */}
<div className="bg-white rounded-2xl border border-slate-100 p-5">
<h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-600"/>Trending Topics</h3>
<div className="space-y-2.5">{TRENDING.map((t,i)=><div key={i} className="flex items-center justify-between"><span className="text-sm text-primary-600 font-semibold cursor-pointer hover:text-primary-700">{t}</span><span className="text-xs text-slate-400">{[842,623,518,492,371,288,214][i]} posts</span></div>)}</div>
</div>

{/* Contributors */}
<div className="bg-white rounded-2xl border border-slate-100 p-5">
<h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500"/>Top Contributors</h3>
<div className="space-y-3">{CONTRIBUTORS.map((c,i)=><div key={i} className="flex items-center gap-3">
<img src={c.avatar} alt="" className="w-9 h-9 rounded-full object-cover"/>
<div className="flex-1"><p className="text-sm font-semibold text-slate-800">{c.name}</p><p className="text-xs text-slate-400">{c.pts} points</p></div>
{i===0&&<span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">🏆</span>}
</div>)}</div>
</div>

{/* Community stats */}
<div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
<h3 className="text-sm font-bold text-slate-900 mb-3">Community Stats</h3>
<div className="grid grid-cols-2 gap-3">
<div className="text-center"><p className="text-lg font-bold text-primary-600">2.4K</p><p className="text-[10px] text-slate-400">Members</p></div>
<div className="text-center"><p className="text-lg font-bold text-emerald-600">890</p><p className="text-[10px] text-slate-400">Posts</p></div>
<div className="text-center"><p className="text-lg font-bold text-amber-600">12K</p><p className="text-[10px] text-slate-400">Likes</p></div>
<div className="text-center"><p className="text-lg font-bold text-purple-600">156</p><p className="text-[10px] text-slate-400">Countries</p></div>
</div>
</div>
</div>
</div>

{/* CREATE POST MODAL */}
{showCreate&&(<>
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={()=>setShowCreate(false)}/>
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in" onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="text-lg font-bold">Create a Post</h3><button onClick={()=>setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400"/></button></div>
<div className="p-5 space-y-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Share your experience..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Content *</label><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={5} placeholder="Tell us about your trip, tips, hidden gems..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Tags (comma separated)</label><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="Paris, France, Budget, Tips" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
</div>
<div className="flex justify-end gap-3 p-5 border-t border-slate-100">
<button onClick={()=>setShowCreate(false)} className="px-5 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl">Cancel</button>
<button onClick={handleCreate} disabled={saving} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 flex items-center gap-2">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}Publish</button>
</div>
</div></div></>)}
</div>);};
export default Community;
