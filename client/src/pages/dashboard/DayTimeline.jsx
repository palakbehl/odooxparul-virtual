import{useState,useEffect}from'react';import{useParams,Link}from'react-router-dom';import{tripAPI,stopAPI,dayPlanAPI,activityAPI,placesAPI}from'../../services/api';import{ChevronRight,Plus,Clock,MapPin,Star,DollarSign,Loader2,X,Search,CalendarDays,Eye,Share2,MoreHorizontal,Pencil,Trash2,ArrowLeft,Utensils,Hotel,Bus,ShoppingBag,Compass}from'lucide-react';

const CAT_COLORS={activity:'bg-blue-500',food:'bg-red-500',stay:'bg-green-500',transfer:'bg-amber-500',shopping:'bg-purple-500',other:'bg-slate-400'};
const CAT_ICONS={activity:Compass,food:Utensils,stay:Hotel,transfer:Bus,shopping:ShoppingBag,other:MapPin};
const CAT_LABELS=[{v:'activity',l:'Activity'},{v:'food',l:'Meal'},{v:'stay',l:'Stay'},{v:'transfer',l:'Transfer'},{v:'shopping',l:'Shopping'}];

const DayTimeline=()=>{
const{tripId}=useParams();
const[trip,setTrip]=useState(null);
const[stops,setStops]=useState([]);
const[days,setDays]=useState([]);
const[loading,setLoading]=useState(true);
const[totalCost,setTotalCost]=useState(0);
const[showAddModal,setShowAddModal]=useState(false);
const[selectedDay,setSelectedDay]=useState(null);
const[editAct,setEditAct]=useState(null);
const[saving,setSaving]=useState(false);
const[searchQ,setSearchQ]=useState('');
const[searchResults,setSearchResults]=useState([]);
const[searching,setSearching]=useState(false);
const[showSummary,setShowSummary]=useState(false);
const[actForm,setActForm]=useState({title:'',description:'',category:'activity',startTime:'',endTime:'',cost:'',costType:'per_person',location:'',image:'',rating:0,duration:''});

useEffect(()=>{if(tripId)loadAll();},[tripId]);

const loadAll=async()=>{setLoading(true);try{
const[tRes,sRes,dRes]=await Promise.all([tripAPI.getOne(tripId),stopAPI.getByTrip(tripId),dayPlanAPI.getByTrip(tripId)]);
if(tRes.data.success)setTrip(tRes.data.trip);
if(sRes.data.success)setStops(sRes.data.stops);
if(dRes.data.success){setDays(dRes.data.days);setTotalCost(dRes.data.totalCost);}
}catch(e){console.error(e);}finally{setLoading(false);}};

const resetForm=()=>setActForm({title:'',description:'',category:'activity',startTime:'',endTime:'',cost:'',costType:'per_person',location:'',image:'',rating:0,duration:''});

const openAdd=(day)=>{setSelectedDay(day);resetForm();setEditAct(null);setShowAddModal(true);setSearchResults([]);setSearchQ('');};

const openEditAct=(day,act)=>{setSelectedDay(day);setEditAct(act);setActForm({title:act.title,description:act.description||'',category:act.category,startTime:act.startTime||'',endTime:act.endTime||'',cost:act.cost||'',costType:act.costType||'per_person',location:act.location||'',image:act.image||'',rating:act.rating||0,duration:act.duration||''});setShowAddModal(true);};

const handleSave=async()=>{if(!actForm.title.trim())return;setSaving(true);try{
const payload={...actForm,cost:Number(actForm.cost)||0,tripId,dayPlanId:selectedDay._id,stopId:selectedDay.stopId};
if(editAct)await activityAPI.update(editAct._id,payload);else await activityAPI.add(payload);
await loadAll();setShowAddModal(false);
}catch(e){console.error(e);}finally{setSaving(false);}};

const handleDeleteAct=async(id)=>{if(!confirm('Delete this activity?'))return;try{await activityAPI.delete(id);await loadAll();}catch(e){console.error(e);}};

const searchActivities=async(q)=>{setSearchQ(q);if(q.length<2){setSearchResults([]);return;}
setSearching(true);try{const city=selectedDay?.cityName||'';const{data}=await placesAPI.attractions(city,q);
if(data.success)setSearchResults(data.results.slice(0,6));}catch(e){console.error(e);}finally{setSearching(false);}};

const selectSearchResult=(r)=>{setActForm({...actForm,title:r.name,description:r.address||'',location:r.address||'',image:r.image||'',rating:r.rating||0,cost:r.estimatedPrice||'',category:'activity'});setSearchResults([]);setSearchQ('');};

const fmt=(d)=>d?new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'-';
const fmtDay=(d)=>d?new Date(d).toLocaleDateString('en-US',{weekday:'short'}):'';

if(loading)return<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin"/></div>;
if(!trip)return<div className="text-center py-20"><p className="text-slate-500">Trip not found</p><Link to="/dashboard/trips" className="text-primary-600 font-semibold mt-2 inline-block">← Back to trips</Link></div>;

return(
<div className="animate-fade-in max-w-4xl mx-auto">
{/* Breadcrumb */}
<div className="flex items-center gap-1.5 text-sm text-slate-400 mb-2 flex-wrap">
<Link to="/dashboard/trips" className="hover:text-primary-600">My Trips</Link><ChevronRight className="w-3.5 h-3.5"/>
<Link to={`/dashboard/itinerary?trip=${tripId}`} className="hover:text-primary-600">{trip.destinations?.[0]?.name||trip.title}</Link><ChevronRight className="w-3.5 h-3.5"/>
<span className="text-slate-700 font-medium">Itinerary</span>
</div>

{/* Header */}
<div className="flex items-start justify-between mb-6">
<div>
<h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Itinerary for {trip.destinations?.[0]?.name||trip.title}</h1>
<p className="text-slate-500 mt-1">{fmt(trip.startDate)} – {fmt(trip.endDate)} · {days.length} Days</p>
</div>
<div className="flex items-center gap-2">
<button onClick={()=>setShowSummary(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-primary-200 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-50"><Eye className="w-4 h-4"/>View Trip Summary</button>
<button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"><Share2 className="w-4 h-4"/>Share</button>
</div>
</div>

{/* Tabs + Legend */}
<div className="flex items-center justify-between mb-6 flex-wrap gap-3">
<div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
<button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold">Itinerary View</button>
<button className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">Calendar View</button>
</div>
<div className="flex items-center gap-4 text-xs text-slate-500">
{CAT_LABELS.map(c=><span key={c.v} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${CAT_COLORS[c.v]}`}/>{c.l}</span>)}
</div>
</div>

{/* Search bar */}
<div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3 mb-6">
<Search className="w-4 h-4 text-slate-400"/>
<input placeholder="Search activities in this trip..." className="flex-1 text-sm bg-transparent outline-none placeholder-slate-400"/>
<span className="text-xs text-slate-400 hidden sm:block">Physical Activity</span>
<span className="text-xs text-slate-400 ml-auto">Expense</span>
</div>

{/* Day Timeline */}
<div className="space-y-0 mb-8">
{days.map((day,di)=>{
const Icon0=CAT_ICONS[day.activities?.[0]?.category]||MapPin;
return(
<div key={day._id} className="relative">
{/* Day Header */}
<div className="flex items-start gap-4 mb-4">
<div className="flex flex-col items-center">
<div className="w-3 h-3 bg-primary-600 rounded-full ring-4 ring-primary-100"/>
{di<days.length-1&&<div className="w-0.5 bg-primary-200 flex-1 min-h-[20px]"/>}
</div>
<div>
<h3 className="text-lg font-bold text-slate-900">Day {day.dayNumber}</h3>
<p className="text-xs text-slate-400">{fmt(day.date)} · {fmtDay(day.date)}</p>
</div>
</div>

{/* Activities */}
<div className="ml-5 pl-5 border-l-2 border-primary-100 space-y-3 pb-6">
{(day.activities||[]).map((act)=>{
const CatIcon=CAT_ICONS[act.category]||MapPin;
return(
<div key={act._id} className="flex items-start gap-3 bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow group">
<div className={`w-8 h-8 ${CAT_COLORS[act.category]} rounded-lg flex items-center justify-center flex-shrink-0`}>
<CatIcon className="w-4 h-4 text-white"/>
</div>
{act.image&&<img src={act.image} alt="" className="w-16 h-14 rounded-lg object-cover flex-shrink-0 hidden sm:block"/>}
<div className="flex-1 min-w-0">
{(act.startTime||act.endTime)&&<p className="text-xs font-semibold text-primary-600 mb-0.5">{act.startTime}{act.endTime?` – ${act.endTime}`:''}</p>}
<h4 className="text-sm font-bold text-slate-900">{act.title}</h4>
{act.description&&<p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{act.description}</p>}
<div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
{act.duration&&<span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{act.duration}</span>}
{act.location&&<span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{act.location}</span>}
</div>
</div>
<div className="text-right flex-shrink-0">
<p className="text-sm font-bold text-slate-900">₹ {(act.cost||0).toLocaleString()}</p>
<p className="text-[10px] text-slate-400 capitalize">{act.costType==='free'?'Free':act.costType==='per_person'?'Per Person':'Total'}</p>
</div>
<div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-1">
<button onClick={()=>openEditAct(day,act)} className="p-1 hover:bg-slate-100 rounded"><Pencil className="w-3.5 h-3.5 text-slate-400"/></button>
<button onClick={()=>handleDeleteAct(act._id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
</div>
</div>
);})}
{(!day.activities||day.activities.length===0)&&<p className="text-sm text-slate-300 italic py-2">No activities yet</p>}
<button onClick={()=>openAdd(day)} className="w-full py-3 border border-dashed border-primary-200 rounded-xl text-primary-600 text-sm font-semibold hover:bg-primary-50 flex items-center justify-center gap-1.5"><Plus className="w-4 h-4"/>Add Activity</button>
</div>
</div>
);})}
</div>

{/* Cost summary */}
{totalCost>0&&<div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-center justify-between"><span className="text-sm font-semibold text-slate-700">Total Trip Cost</span><span className="text-lg font-bold text-emerald-700">₹ {totalCost.toLocaleString()}</span></div>}

{/* Bottom nav */}
<div className="flex items-center justify-between pb-8">
<Link to={`/dashboard/itinerary?trip=${tripId}`} className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"><ArrowLeft className="w-4 h-4"/>Back</Link>
<Link to={`/dashboard/itinerary?trip=${tripId}`} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 flex items-center gap-2"><Pencil className="w-4 h-4"/>Edit Itinerary</Link>
</div>

{/* ADD/EDIT ACTIVITY MODAL */}
{showAddModal&&(<>
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={()=>setShowAddModal(false)}/>
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-between p-5 border-b border-slate-100">
<div><h3 className="text-lg font-bold text-slate-900">{editAct?'Edit Activity':'Add Activity'}</h3><p className="text-xs text-slate-400">Day {selectedDay?.dayNumber} · {selectedDay?.cityName}</p></div>
<button onClick={()=>setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400"/></button>
</div>
<div className="p-5 space-y-4">
{/* Search from API */}
{!editAct&&<div className="relative"><label className="block text-sm font-semibold text-slate-700 mb-1">Search Activities in {selectedDay?.cityName}</label>
<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
<input value={searchQ} onChange={e=>searchActivities(e.target.value)} placeholder="e.g., museums, restaurants, tours..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/>
{searching&&<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary-500"/>}
</div>
{searchResults.length>0&&<div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
{searchResults.map((r,i)=><button key={i} onClick={()=>selectSearchResult(r)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 text-left"><MapPin className="w-4 h-4 text-primary-500 flex-shrink-0"/><div className="min-w-0"><p className="text-sm font-medium text-slate-800 truncate">{r.name}</p><p className="text-xs text-slate-400 truncate">{r.address||r.category}</p></div>{r.rating>0&&<span className="ml-auto text-xs text-amber-600 flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{r.rating}</span>}</button>)}
</div>}
</div>}
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label><input value={actForm.title} onChange={e=>setActForm({...actForm,title:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Description</label><textarea value={actForm.description} onChange={e=>setActForm({...actForm,description:e.target.value})} rows={2} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label><div className="flex flex-wrap gap-2">{CAT_LABELS.map(c=><button key={c.v} type="button" onClick={()=>setActForm({...actForm,category:c.v})} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${actForm.category===c.v?'bg-primary-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{c.l}</button>)}</div></div>
<div className="grid grid-cols-2 gap-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label><input type="time" value={actForm.startTime} onChange={e=>setActForm({...actForm,startTime:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label><input type="time" value={actForm.endTime} onChange={e=>setActForm({...actForm,endTime:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
</div>
<div className="grid grid-cols-2 gap-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Cost (₹)</label><input type="number" value={actForm.cost} onChange={e=>setActForm({...actForm,cost:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Cost Type</label><select value={actForm.costType} onChange={e=>setActForm({...actForm,costType:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"><option value="per_person">Per Person</option><option value="total">Total</option><option value="free">Free</option></select></div>
</div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Location</label><input value={actForm.location} onChange={e=>setActForm({...actForm,location:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
</div>
<div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
<button onClick={()=>setShowAddModal(false)} className="px-5 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl">Cancel</button>
<button onClick={handleSave} disabled={saving||!actForm.title.trim()} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}{editAct?'Update':'Add'}</button>
</div>
</div></div></>)}

{/* TRIP SUMMARY MODAL */}
{showSummary&&(<>
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={()=>setShowSummary(false)}/>
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in" onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">Trip Summary</h3><button onClick={()=>setShowSummary(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400"/></button></div>
<div className="p-5 space-y-3">
<h4 className="font-bold text-slate-900 text-lg">{trip.title}</h4>
{trip.description&&<p className="text-sm text-slate-500">{trip.description}</p>}
<div className="grid grid-cols-2 gap-3">
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Dates</p><p className="text-sm font-semibold">{fmt(trip.startDate)} – {fmt(trip.endDate)}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Travelers</p><p className="text-sm font-semibold">{trip.travelerCount||1}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Cities/Stops</p><p className="text-sm font-semibold">{stops.length}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Total Days</p><p className="text-sm font-semibold">{days.length}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Activities</p><p className="text-sm font-semibold">{days.reduce((s,d)=>s+(d.activities?.length||0),0)}</p></div>
<div className="bg-emerald-50 rounded-xl p-3"><p className="text-xs text-emerald-600">Est. Cost</p><p className="text-sm font-bold text-emerald-700">₹ {totalCost.toLocaleString()}</p></div>
</div>
</div>
<div className="p-5 border-t border-slate-100"><button onClick={()=>setShowSummary(false)} className="w-full py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">Close</button></div>
</div></div></>)}
</div>);};
export default DayTimeline;
