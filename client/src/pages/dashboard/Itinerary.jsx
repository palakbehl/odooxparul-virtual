import{useState,useEffect}from'react';import{Link,useSearchParams}from'react-router-dom';import{tripAPI,itineraryAPI}from'../../services/api';import{CalendarDays,Plus,MapPin,Loader2,Pencil,MoreHorizontal,Trash2,ArrowLeft,ArrowRight,ChevronRight,Eye,Users,Globe,GripVertical,X,DollarSign,Info,Landmark}from'lucide-react';

const Itinerary=()=>{
const[searchParams]=useSearchParams();
const tripIdParam=searchParams.get('trip');
const[trips,setTrips]=useState([]);
const[selectedTrip,setSelectedTrip]=useState(null);
const[sections,setSections]=useState([]);
const[loading,setLoading]=useState(true);
const[sectionsLoading,setSectionsLoading]=useState(false);
const[showAddModal,setShowAddModal]=useState(false);
const[editSection,setEditSection]=useState(null);
const[menuOpen,setMenuOpen]=useState(null);
const[saving,setSaving]=useState(false);
const[totalCost,setTotalCost]=useState(0);
const[showSummary,setShowSummary]=useState(false);
const[sectionForm,setSectionForm]=useState({cityName:'',country:'',description:'',startDate:'',endDate:'',estimatedCost:'',coverImage:'',notes:''});

const covers=['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80','https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300&q=80','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300&q=80','https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&q=80','https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&q=80'];

useEffect(()=>{loadTrips();},[]);
useEffect(()=>{if(selectedTrip)loadSections(selectedTrip._id);},[selectedTrip]);

const loadTrips=async()=>{try{const{data}=await tripAPI.getAll({sort:'-createdAt'});if(data.success&&data.trips.length>0){setTrips(data.trips);const t=tripIdParam?data.trips.find(x=>x._id===tripIdParam):data.trips[0];setSelectedTrip(t||data.trips[0]);}}catch(e){console.error(e);}finally{setLoading(false);}};
const loadSections=async(id)=>{setSectionsLoading(true);try{const{data}=await itineraryAPI.getByTrip(id);if(data.success){setSections(data.sections);setTotalCost(data.totalCost);}}catch(e){console.error(e);}finally{setSectionsLoading(false);}};
const resetForm=()=>setSectionForm({cityName:'',country:'',description:'',startDate:'',endDate:'',estimatedCost:'',coverImage:'',notes:''});

const handleSave=async()=>{if(!sectionForm.cityName.trim())return;setSaving(true);try{const p={...sectionForm,tripId:selectedTrip._id,estimatedCost:Number(sectionForm.estimatedCost)||0};if(editSection)await itineraryAPI.update(editSection._id,p);else await itineraryAPI.add(p);await loadSections(selectedTrip._id);setShowAddModal(false);setEditSection(null);resetForm();}catch(e){console.error(e);}finally{setSaving(false);}};
const handleDelete=async(id)=>{if(!confirm('Delete this section?'))return;try{await itineraryAPI.delete(id);await loadSections(selectedTrip._id);}catch(e){console.error(e);}};
const openEdit=(s)=>{setEditSection(s);setSectionForm({cityName:s.cityName,country:s.country||'',description:s.description||'',startDate:s.startDate?.slice(0,10)||'',endDate:s.endDate?.slice(0,10)||'',estimatedCost:s.estimatedCost||'',coverImage:s.coverImage||'',notes:s.notes||''});setShowAddModal(true);setMenuOpen(null);};
const fmt=(d)=>d?new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
const tp=selectedTrip;

if(loading)return<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin"/></div>;
if(!tp)return(<div className="bg-white rounded-2xl border border-slate-100 p-12 text-center"><CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4"/><h3 className="text-xl font-bold text-slate-900 mb-2">No trips yet</h3><p className="text-slate-500 mb-6">Create a trip first to build your itinerary</p><Link to="/dashboard/trips/new" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm"><Plus className="w-4 h-4"/>Create Trip</Link></div>);

return(
<div className="animate-fade-in max-w-5xl mx-auto">
{/* Breadcrumb */}
<div className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
<Link to="/dashboard/trips" className="hover:text-primary-600 transition-colors">My Trips</Link>
<ChevronRight className="w-3.5 h-3.5"/>
<span>Create a New Trip</span>
<ChevronRight className="w-3.5 h-3.5"/>
<span className="text-slate-700 font-medium">Build Itinerary</span>
</div>

<div className="flex items-start justify-between mb-6">
<div>
<h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Build Your Itinerary</h1>
<p className="text-slate-500 mt-1">Add details for each section of your trip</p>
</div>
<img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&q=80" alt="" className="hidden md:block w-28 h-20 rounded-2xl object-cover opacity-80"/>
</div>

{/* Trip Summary Card */}
<div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
<img src={tp.coverImage||covers[0]} alt="" className="w-24 h-20 rounded-xl object-cover flex-shrink-0"/>
<div className="flex-1 min-w-0">
<h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">{tp.title}<Pencil className="w-3.5 h-3.5 text-slate-400 cursor-pointer"/></h2>
<div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-slate-500">
<span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-primary-500"/>{fmt(tp.startDate)} – {fmt(tp.endDate)}</span>
<span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary-500"/>{tp.travelerCount||tp.travelers?.length||1} Travelers</span>
<span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary-500"/>{tp.destinations?.length||0} Destinations</span>
</div>
</div>
<button onClick={()=>setShowSummary(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-primary-200 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors whitespace-nowrap">
<Eye className="w-4 h-4"/>View Trip Summary
</button>
</div>

{/* Trip Selector */}
{trips.length>1&&(
<div className="mb-4">
<select value={tp._id} onChange={e=>setSelectedTrip(trips.find(t=>t._id===e.target.value))} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
{trips.map(t=><option key={t._id} value={t._id}>{t.title}</option>)}
</select>
</div>
)}

{/* Info */}
<div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
<Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"/>
<div><p className="text-sm font-semibold text-slate-800">Add details for each section of your trip</p><p className="text-xs text-slate-500">Include dates, budget and any activities or notes for each part of your journey.</p></div>
</div>

{/* Sections */}
{sectionsLoading?<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-600 animate-spin"/></div>:(
<div className="space-y-4 mb-6">
{sections.map((s,i)=>(
<div key={s._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
<div className="flex items-start gap-4">
<div className="flex flex-col items-center gap-1 pt-1">
<span className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
<GripVertical className="w-4 h-4 text-slate-300 cursor-grab"/>
</div>
<img src={s.coverImage||covers[i%covers.length]} alt="" className="w-24 h-20 rounded-xl object-cover flex-shrink-0 hidden sm:block"/>
<div className="flex-1 min-w-0">
<h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><Landmark className="w-4 h-4 text-primary-500"/>{s.cityName}{s.country?`, ${s.country}`:''}</h3>
<p className="text-sm text-slate-500 mt-1 line-clamp-2">{s.description||'No description added.'}</p>
<div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
{(s.startDate||s.endDate)&&<span className="flex items-center gap-1"><CalendarDays className="w-3 h-3"/>{fmt(s.startDate)} – {fmt(s.endDate)}</span>}
{s.estimatedCost>0&&<span className="flex items-center gap-1"><DollarSign className="w-3 h-3"/>₹ {s.estimatedCost.toLocaleString()}</span>}
</div>
</div>
<div className="flex items-center gap-2 flex-shrink-0">
<button onClick={()=>openEdit(s)} className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"><Pencil className="w-3.5 h-3.5"/>Edit</button>
<div className="relative">
<button onClick={()=>setMenuOpen(menuOpen===s._id?null:s._id)} className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors"><MoreHorizontal className="w-4 h-4"/></button>
{menuOpen===s._id&&(<><div className="fixed inset-0 z-40" onClick={()=>setMenuOpen(null)}/><div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border shadow-lg z-50 p-1"><button onClick={()=>handleDelete(s._id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5"/>Delete</button></div></>)}
</div>
</div>
</div>
</div>
))}
<button onClick={()=>{resetForm();setEditSection(null);setShowAddModal(true);}} className="w-full py-5 border-2 border-dashed border-primary-200 rounded-2xl text-primary-600 hover:bg-primary-50 hover:border-primary-300 transition-all flex flex-col items-center gap-1">
<div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center mb-1"><Plus className="w-5 h-5"/></div>
<span className="text-sm font-semibold">Add another section</span>
<span className="text-xs text-slate-400">Add more cities, places or activities to your trip</span>
</button>
</div>
)}

{totalCost>0&&<div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-center justify-between"><span className="text-sm font-semibold text-slate-700">Total Estimated Cost</span><span className="text-lg font-bold text-emerald-700">₹ {totalCost.toLocaleString()}</span></div>}

<div className="flex items-center justify-between pb-8">
<Link to="/dashboard/trips" className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"><ArrowLeft className="w-4 h-4"/>Back</Link>
<Link to="/dashboard/trips" className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">Continue<ArrowRight className="w-4 h-4"/></Link>
</div>

{/* ADD/EDIT MODAL */}
{showAddModal&&(<>
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={()=>{setShowAddModal(false);setEditSection(null);}}/>
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">{editSection?'Edit Section':'Add New Section'}</h3><button onClick={()=>{setShowAddModal(false);setEditSection(null);}} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400"/></button></div>
<div className="p-5 space-y-4">
<div className="grid grid-cols-2 gap-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1">City Name *</label><input value={sectionForm.cityName} onChange={e=>setSectionForm({...sectionForm,cityName:e.target.value})} placeholder="e.g., Paris" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Country</label><input value={sectionForm.country} onChange={e=>setSectionForm({...sectionForm,country:e.target.value})} placeholder="e.g., France" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
</div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Description</label><textarea value={sectionForm.description} onChange={e=>setSectionForm({...sectionForm,description:e.target.value})} placeholder="Describe this stop..." rows={2} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"/></div>
<div className="grid grid-cols-2 gap-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label><input type="date" value={sectionForm.startDate} onChange={e=>setSectionForm({...sectionForm,startDate:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label><input type="date" value={sectionForm.endDate} onChange={e=>setSectionForm({...sectionForm,endDate:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
</div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Estimated Cost (₹)</label><input type="number" value={sectionForm.estimatedCost} onChange={e=>setSectionForm({...sectionForm,estimatedCost:e.target.value})} placeholder="60000" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Image</label><div className="grid grid-cols-3 gap-2">{covers.map((img,i)=>(<button key={i} type="button" onClick={()=>setSectionForm({...sectionForm,coverImage:img})} className={`rounded-xl overflow-hidden aspect-video border-2 transition-all ${sectionForm.coverImage===img?'border-primary-500 ring-2 ring-primary-200':'border-transparent hover:border-slate-300'}`}><img src={img} alt="" className="w-full h-full object-cover"/></button>))}</div></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label><textarea value={sectionForm.notes} onChange={e=>setSectionForm({...sectionForm,notes:e.target.value})} placeholder="Any extra notes..." rows={2} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"/></div>
</div>
<div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
<button onClick={()=>{setShowAddModal(false);setEditSection(null);}} className="px-5 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl">Cancel</button>
<button onClick={handleSave} disabled={saving||!sectionForm.cityName.trim()} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-all">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}{editSection?'Update':'Add Section'}</button>
</div>
</div>
</div>
</>)}

{/* TRIP SUMMARY MODAL */}
{showSummary&&(<>
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={()=>setShowSummary(false)}/>
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in" onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">Trip Summary</h3><button onClick={()=>setShowSummary(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400"/></button></div>
<div className="p-5 space-y-4">
<div className="flex items-center gap-4">
<img src={tp.coverImage||covers[0]} alt="" className="w-20 h-16 rounded-xl object-cover"/>
<div><h4 className="font-bold text-slate-900">{tp.title}</h4><p className="text-xs text-slate-400 mt-0.5">{tp.tripType||'Trip'}</p></div>
</div>
{tp.description&&<p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3">{tp.description}</p>}
<div className="grid grid-cols-2 gap-3">
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400 mb-1">Dates</p><p className="text-sm font-semibold text-slate-800">{fmt(tp.startDate)} – {fmt(tp.endDate)}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400 mb-1">Travelers</p><p className="text-sm font-semibold text-slate-800">{tp.travelerCount||tp.travelers?.length||1}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400 mb-1">Destinations</p><p className="text-sm font-semibold text-slate-800">{tp.destinations?.map(d=>d.name).join(', ')||'—'}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400 mb-1">Itinerary Stops</p><p className="text-sm font-semibold text-slate-800">{sections.length}</p></div>
<div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400 mb-1">Status</p><p className="text-sm font-semibold text-slate-800 capitalize">{tp.status}</p></div>
<div className="bg-emerald-50 rounded-xl p-3"><p className="text-xs text-emerald-600 mb-1">Est. Budget</p><p className="text-sm font-bold text-emerald-700">₹ {totalCost.toLocaleString()}</p></div>
</div>
</div>
<div className="p-5 border-t border-slate-100"><button onClick={()=>setShowSummary(false)} className="w-full py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">Close</button></div>
</div>
</div>
</>)}
</div>
);};
export default Itinerary;
