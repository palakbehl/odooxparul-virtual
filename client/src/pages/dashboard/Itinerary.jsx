import{useState,useEffect}from'react';import{Link,useSearchParams}from'react-router-dom';import{tripAPI,stopAPI,dayPlanAPI}from'../../services/api';import{CalendarDays,Plus,MapPin,Loader2,Pencil,Trash2,ArrowLeft,ArrowRight,ChevronRight,Eye,Users,Globe,GripVertical,X,Info,Landmark,Plane,Train,Bus,Car,Ship,CheckCircle}from'lucide-react';

const TRANSPORT=[{v:'flight',l:'Flight',I:Plane},{v:'train',l:'Train',I:Train},{v:'bus',l:'Bus',I:Bus},{v:'car',l:'Car',I:Car},{v:'ferry',l:'Ferry',I:Ship}];
const COVERS=['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80','https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300&q=80','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300&q=80','https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&q=80','https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&q=80'];

const Itinerary=()=>{
const[searchParams]=useSearchParams();
const tripIdParam=searchParams.get('trip');
const[trips,setTrips]=useState([]);
const[tp,setTp]=useState(null);
const[stops,setStops]=useState([]);
const[days,setDays]=useState([]);
const[loading,setLoading]=useState(true);
const[stopsLoading,setStopsLoading]=useState(false);
const[showModal,setShowModal]=useState(false);
const[editStop,setEditStop]=useState(null);
const[saving,setSaving]=useState(false);
const[showSummary,setShowSummary]=useState(false);
const[form,setForm]=useState({cityName:'',country:'',arrivalDate:'',departureDate:'',hotel:{name:'',address:'',costPerNight:0,nights:0},transportMode:'flight',transportCost:0,notes:'',coverImage:''});

useEffect(()=>{loadTrips();},[]);
useEffect(()=>{if(tp){loadStops(tp._id);loadDays(tp._id);}},[tp]);

const loadTrips=async()=>{try{const{data}=await tripAPI.getAll({sort:'-createdAt'});if(data.success&&data.trips.length>0){setTrips(data.trips);const t=tripIdParam?data.trips.find(x=>x._id===tripIdParam):data.trips[0];setTp(t||data.trips[0]);}}catch(e){console.error(e);}finally{setLoading(false);}};
const loadStops=async(id)=>{setStopsLoading(true);try{const{data}=await stopAPI.getByTrip(id);if(data.success)setStops(data.stops);}catch(e){console.error(e);}finally{setStopsLoading(false);}};
const loadDays=async(id)=>{try{const{data}=await dayPlanAPI.getByTrip(id);if(data.success)setDays(data.days);}catch(e){console.error(e);}};

const resetForm=()=>setForm({cityName:'',country:'',arrivalDate:'',departureDate:'',hotel:{name:'',address:'',costPerNight:0,nights:0},transportMode:'flight',transportCost:0,notes:'',coverImage:''});

const handleSave=async()=>{if(!form.cityName.trim()||!form.arrivalDate||!form.departureDate)return;setSaving(true);try{
const arr=new Date(form.arrivalDate);const dep=new Date(form.departureDate);const nights=Math.max(0,Math.ceil((dep-arr)/86400000));
const payload={...form,tripId:tp._id,hotel:{...form.hotel,nights,costPerNight:Number(form.hotel.costPerNight)||0},transportCost:Number(form.transportCost)||0};
if(editStop)await stopAPI.update(editStop._id,payload);else await stopAPI.add(payload);
await loadStops(tp._id);await loadDays(tp._id);setShowModal(false);setEditStop(null);resetForm();
}catch(e){console.error(e);}finally{setSaving(false);}};

const handleDelete=async(id)=>{if(!confirm('Delete this stop and all its days/activities?'))return;try{await stopAPI.delete(id);await loadStops(tp._id);await loadDays(tp._id);}catch(e){console.error(e);}};
const openEdit=(s)=>{setEditStop(s);setForm({cityName:s.cityName,country:s.country||'',arrivalDate:s.arrivalDate?.slice(0,10)||'',departureDate:s.departureDate?.slice(0,10)||'',hotel:s.hotel||{name:'',address:'',costPerNight:0,nights:0},transportMode:s.transportMode||'flight',transportCost:s.transportCost||0,notes:s.notes||'',coverImage:s.coverImage||''});setShowModal(true);};

const fmt=(d)=>d?new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
const getDaysForStop=(sId)=>days.filter(d=>d.stopId===sId);

if(loading)return<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin"/></div>;
if(!tp)return<div className="bg-white rounded-2xl border border-slate-100 p-12 text-center"><CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4"/><h3 className="text-xl font-bold text-slate-900 mb-2">No trips yet</h3><Link to="/dashboard/trips/new" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm"><Plus className="w-4 h-4"/>Create Trip</Link></div>;

return(
<div className="animate-fade-in max-w-5xl mx-auto">
{/* Breadcrumb */}
<div className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
<Link to="/dashboard/trips" className="hover:text-primary-600">My Trips</Link><ChevronRight className="w-3.5 h-3.5"/>
<span>Create a New Trip</span><ChevronRight className="w-3.5 h-3.5"/>
<span className="text-slate-700 font-medium">Build Itinerary</span>
</div>

<div className="flex items-start justify-between mb-6">
<div><h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Build Your Itinerary</h1><p className="text-slate-500 mt-1">Add cities/stops for your trip</p></div>
</div>

{/* Trip Card */}
<div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
<img src={COVERS[0]} alt="" className="w-24 h-20 rounded-xl object-cover flex-shrink-0"/>
<div className="flex-1 min-w-0">
<h2 className="text-lg font-bold text-slate-900">{tp.title}</h2>
<div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-slate-500">
<span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-primary-500"/>{fmt(tp.startDate)} – {fmt(tp.endDate)}</span>
<span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary-500"/>{tp.travelerCount||1} Travelers</span>
<span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary-500"/>{tp.destinations?.length||0} Destinations</span>
</div>
</div>
<div className="flex items-center gap-2">
<button onClick={()=>setShowSummary(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-primary-200 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-50"><Eye className="w-4 h-4"/>View Summary</button>
</div>
</div>

{/* Trip Selector */}
{trips.length>1&&<div className="mb-4"><select value={tp._id} onChange={e=>setTp(trips.find(t=>t._id===e.target.value))} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm">{trips.map(t=><option key={t._id} value={t._id}>{t.title}</option>)}</select></div>}

{/* Info */}
<div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
<Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"/>
<div><p className="text-sm font-semibold text-slate-800">Add your cities/stops below</p><p className="text-xs text-slate-500">Days are auto-generated based on your dates. After adding stops, view the day-wise timeline to add activities.</p></div>
</div>

{/* Stops */}
{stopsLoading?<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-600 animate-spin"/></div>:
<div className="space-y-4 mb-6">
{stops.map((s,i)=>{
const sDays=getDaysForStop(s._id);
const TIcon=TRANSPORT.find(t=>t.v===s.transportMode)?.I||Plane;
return(
<div key={s._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
<div className="p-5 flex items-start gap-4">
<div className="flex flex-col items-center gap-1 pt-1">
<span className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
<GripVertical className="w-4 h-4 text-slate-300 cursor-grab"/>
</div>
<img src={s.coverImage||COVERS[i%COVERS.length]} alt="" className="w-24 h-20 rounded-xl object-cover flex-shrink-0 hidden sm:block"/>
<div className="flex-1 min-w-0">
<h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><Landmark className="w-4 h-4 text-primary-500"/>{s.cityName}{s.country?`, ${s.country}`:''}</h3>
<div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
<span className="flex items-center gap-1"><CalendarDays className="w-3 h-3"/>{fmt(s.arrivalDate)} → {fmt(s.departureDate)}</span>
<span className="flex items-center gap-1"><TIcon className="w-3 h-3"/>{s.transportMode}</span>
{s.hotel?.name&&<span className="flex items-center gap-1">🏨 {s.hotel.name}</span>}
</div>
{s.notes&&<p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.notes}</p>}
{/* Generated days indicator */}
<div className="flex items-center gap-1.5 mt-2 flex-wrap">
{sDays.map(d=><span key={d._id} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-[10px] font-semibold">Day {d.dayNumber} · {fmt(d.date)}</span>)}
{sDays.length>0&&<CheckCircle className="w-3.5 h-3.5 text-emerald-500"/>}
</div>
</div>
<div className="flex items-center gap-2 flex-shrink-0">
<button onClick={()=>openEdit(s)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"><Pencil className="w-3.5 h-3.5"/>Edit</button>
<button onClick={()=>handleDelete(s._id)} className="p-2 border border-slate-200 rounded-xl text-red-400 hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
</div>
</div>
</div>);})}

<button onClick={()=>{resetForm();setEditStop(null);setShowModal(true);}} className="w-full py-5 border-2 border-dashed border-primary-200 rounded-2xl text-primary-600 hover:bg-primary-50 hover:border-primary-300 transition-all flex flex-col items-center gap-1">
<div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center mb-1"><Plus className="w-5 h-5"/></div>
<span className="text-sm font-semibold">Add a City / Stop</span>
<span className="text-xs text-slate-400">Days will be auto-generated based on your dates</span>
</button>
</div>}

{/* Next Step CTA */}
{stops.length>0&&days.length>0&&(
<div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
<CheckCircle className="w-10 h-10 text-emerald-500 flex-shrink-0"/>
<div className="flex-1 text-center sm:text-left">
<h3 className="text-base font-bold text-slate-900">🎉 Stops added! {days.length} days generated</h3>
<p className="text-sm text-slate-500 mt-0.5">Proceed to the day-wise planner to add activities, meals, and more to each day.</p>
</div>
<Link to={`/dashboard/timeline/${tp._id}`} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md whitespace-nowrap">Continue to Day Planner<ArrowRight className="w-4 h-4"/></Link>
</div>
)}

{/* Bottom nav */}
<div className="flex items-center justify-between pb-8">
<Link to="/dashboard/trips" className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"><ArrowLeft className="w-4 h-4"/>Back</Link>
{stops.length>0&&days.length>0&&<Link to={`/dashboard/timeline/${tp._id}`} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">View Day-wise Timeline<ArrowRight className="w-4 h-4"/></Link>}
</div>

{/* ADD/EDIT STOP MODAL */}
{showModal&&(<>
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={()=>{setShowModal(false);setEditStop(null);}}/>
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">{editStop?'Edit Stop':'Add City / Stop'}</h3><button onClick={()=>{setShowModal(false);setEditStop(null);}} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400"/></button></div>
<div className="p-5 space-y-4">
<div className="grid grid-cols-2 gap-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1">City *</label><input value={form.cityName} onChange={e=>setForm({...form,cityName:e.target.value})} placeholder="Paris" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Country</label><input value={form.country} onChange={e=>setForm({...form,country:e.target.value})} placeholder="France" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
</div>
<div className="grid grid-cols-2 gap-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Arrival Date *</label><input type="date" value={form.arrivalDate} onChange={e=>setForm({...form,arrivalDate:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Departure Date *</label><input type="date" value={form.departureDate} onChange={e=>setForm({...form,departureDate:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
</div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Transport</label><div className="flex flex-wrap gap-2">{TRANSPORT.map(t=><button key={t.v} type="button" onClick={()=>setForm({...form,transportMode:t.v})} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.transportMode===t.v?'bg-primary-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><t.I className="w-3.5 h-3.5"/>{t.l}</button>)}</div></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Transport Cost (₹)</label><input type="number" value={form.transportCost} onChange={e=>setForm({...form,transportCost:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div className="grid grid-cols-2 gap-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Hotel Name</label><input value={form.hotel.name} onChange={e=>setForm({...form,hotel:{...form.hotel,name:e.target.value}})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Cost/Night (₹)</label><input type="number" value={form.hotel.costPerNight} onChange={e=>setForm({...form,hotel:{...form.hotel,costPerNight:e.target.value}})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
</div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Image</label><div className="grid grid-cols-3 gap-2">{COVERS.map((img,i)=><button key={i} type="button" onClick={()=>setForm({...form,coverImage:img})} className={`rounded-xl overflow-hidden aspect-video border-2 transition-all ${form.coverImage===img?'border-primary-500 ring-2 ring-primary-200':'border-transparent hover:border-slate-300'}`}><img src={img} alt="" className="w-full h-full object-cover"/></button>)}</div></div>
</div>
<div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
<button onClick={()=>{setShowModal(false);setEditStop(null);}} className="px-5 py-2.5 text-slate-600 text-sm font-medium">Cancel</button>
<button onClick={handleSave} disabled={saving||!form.cityName.trim()} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}{editStop?'Update':'Add Stop'}</button>
</div>
</div></div></>)}

{/* SUMMARY MODAL */}
{showSummary&&(<>
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={()=>setShowSummary(false)}/>
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in" onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="text-lg font-bold">Trip Summary</h3><button onClick={()=>setShowSummary(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400"/></button></div>
<div className="p-5 space-y-3">
<h4 className="font-bold text-lg">{tp.title}</h4>
{tp.description&&<p className="text-sm text-slate-500">{tp.description}</p>}
<div className="grid grid-cols-2 gap-3">
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Dates</p><p className="text-sm font-semibold">{fmt(tp.startDate)} – {fmt(tp.endDate)}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Travelers</p><p className="text-sm font-semibold">{tp.travelerCount||1}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Stops</p><p className="text-sm font-semibold">{stops.length}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Total Days</p><p className="text-sm font-semibold">{days.length}</p></div>
</div>
</div>
<div className="p-5 border-t border-slate-100"><button onClick={()=>setShowSummary(false)} className="w-full py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">Close</button></div>
</div></div></>)}
</div>);};
export default Itinerary;
