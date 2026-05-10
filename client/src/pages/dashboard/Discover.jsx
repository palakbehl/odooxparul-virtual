import{useState,useEffect}from'react';import{placesAPI}from'../../services/api';import{Search,X,MapPin,Star,Clock,DollarSign,ChevronLeft,ChevronRight,Loader2,Heart,Filter,ArrowUpDown,Compass,SlidersHorizontal}from'lucide-react';

const CATS=['All Categories','Adventure','Beaches','Mountains','Heritage','Food & Culture','Museums','Shopping','Nightlife'];
const DURATIONS=['Any Duration','< 1 hour','1-3 hours','3-6 hours','Full day'];
const PRICES=['Any Price','Free','₹0–₹1000','₹1000–₹5000','₹5000+'];

const Discover=()=>{
const[query,setQuery]=useState('');const[results,setResults]=useState([]);const[loading,setLoading]=useState(false);
const[cat,setCat]=useState('All Categories');const[page,setPage]=useState(1);const[total,setTotal]=useState(0);
const[fav,setFav]=useState(new Set());const PER=10;

useEffect(()=>{loadDefault();},[]);

const loadDefault=async()=>{setLoading(true);try{const{data}=await placesAPI.suggestions('Popular');if(data.success)setResults(data.results);setTotal(data.results?.length||0);}catch(e){}finally{setLoading(false);}};

const handleSearch=async(q)=>{const term=q||query;if(!term.trim())return loadDefault();setLoading(true);setPage(1);try{
const c=cat!=='All Categories'?cat:'';
const{data}=await placesAPI.attractions(term,c||'tourist attractions');
if(data.success){setResults(data.results||[]);setTotal(data.results?.length||0);}
}catch(e){console.error(e);}finally{setLoading(false);}};

const toggleFav=(n)=>setFav(p=>{const s=new Set(p);s.has(n)?s.delete(n):s.add(n);return s;});
const paginated=results.slice((page-1)*PER,page*PER);
const totalPages=Math.ceil(results.length/PER)||1;

return(
<div className="animate-fade-in max-w-5xl mx-auto">
<div className="flex items-center gap-1.5 text-sm text-slate-400 mb-2"><span>Discover</span><ChevronRight className="w-3.5 h-3.5"/><span className="text-slate-700 font-medium">Activities</span></div>
<div className="mb-6"><h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Find Activities</h1><p className="text-slate-500 mt-1">Search and discover amazing things to do</p></div>

{/* Search + controls */}
<div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
<div className="flex items-center gap-3 mb-3">
<div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Search activities, restaurants, museums..." className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/>
{query&&<button onClick={()=>{setQuery('');loadDefault();}} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-400"/></button>}</div>
<button onClick={()=>handleSearch()} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700"><Search className="w-4 h-4"/></button>
<button className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"><SlidersHorizontal className="w-4 h-4"/>Group by</button>
<button className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"><Filter className="w-4 h-4"/>Filter</button>
<button className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"><ArrowUpDown className="w-4 h-4"/>Sort by</button>
</div>
{/* Filter chips */}
<div className="flex flex-wrap gap-2">
{CATS.map(c=><button key={c} onClick={()=>{setCat(c);if(query)handleSearch();}} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${cat===c?'bg-primary-600 text-white border-primary-600':'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}>{c}</button>)}
</div>
</div>

{/* Results */}
<div className="flex items-center justify-between mb-4">
<p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-700">{results.length}</span> results{query?` for "${query}"`:''}</p>
<p className="text-sm text-slate-500">Sort by: <span className="text-primary-600 font-semibold">Recommended</span></p>
</div>

{loading?<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-600 animate-spin"/></div>:
results.length===0?<div className="bg-white rounded-2xl border border-slate-100 p-12 text-center"><Compass className="w-16 h-16 text-slate-300 mx-auto mb-4"/><p className="text-slate-500">No results found. Try a different search.</p></div>:
<div className="space-y-4 mb-8">
{paginated.map((r,i)=>{
const tags=['Popular','Top Rated','Trending'];const tag=tags[i%3];const tagColor=tag==='Popular'?'bg-primary-100 text-primary-700':tag==='Top Rated'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700';
return(
<div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4">
<div className="relative w-full sm:w-44 h-32 flex-shrink-0 rounded-xl overflow-hidden">
<img src={r.image||`https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80`} alt="" className="w-full h-full object-cover"/>
<button onClick={()=>toggleFav(r.name)} className={`absolute top-2 right-2 p-1.5 rounded-full ${fav.has(r.name)?'bg-red-500 text-white':'bg-white/80 text-slate-400 hover:text-red-500'}`}><Heart className={`w-4 h-4 ${fav.has(r.name)?'fill-white':''}`}/></button>
</div>
<div className="flex-1 min-w-0">
<div className="flex items-start justify-between">
<div>
<h3 className="text-base font-bold text-slate-900">{r.name}</h3>
<p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{r.country||r.address||'Unknown location'}</p>
</div>
<span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${tagColor}`}>{tag==='Top Rated'?'⭐ ':tag==='Trending'?'📈 ':'● '}{tag}</span>
</div>
{r.rating>0&&<div className="flex items-center gap-1 mt-1.5"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/><span className="text-sm font-bold text-slate-900">{r.rating}</span><span className="text-xs text-slate-400">({r.reviews||0} reviews)</span></div>}
<p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{r.description||`Explore this amazing ${r.category||'attraction'} and enjoy breathtaking views.`}</p>
<div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
<span className="flex items-center gap-1"><Clock className="w-3 h-3"/>10–20 min</span>
{r.category&&<span className="flex items-center gap-1"><Compass className="w-3 h-3"/>{r.category}</span>}
{r.estimatedPrice&&<span className="flex items-center gap-1"><DollarSign className="w-3 h-3"/>₹ {r.estimatedPrice}</span>}
</div>
</div>
<div className="flex items-center">
<button className="px-4 py-2 border border-primary-200 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-50 whitespace-nowrap">View Details</button>
</div>
</div>);})}
</div>}

{/* Pagination */}
{totalPages>1&&<div className="flex items-center justify-center gap-2 pb-8">
<button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
{Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-semibold ${page===p?'bg-primary-600 text-white':'border border-slate-200 hover:bg-slate-50'}`}>{p}</button>)}
{totalPages>5&&<span className="text-slate-400">...</span>}
<button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
</div>}
</div>);};
export default Discover;
