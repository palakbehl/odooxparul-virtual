import{useState,useEffect}from'react';import{tripAPI,expenseAPI}from'../../services/api';import{DollarSign,Plus,Loader2,X,PieChart,TrendingUp,Hotel,Plane,Utensils,ShoppingBag,Compass,AlertTriangle,Trash2,Pencil,Check}from'lucide-react';

const CAT_DATA=[{k:'hotel',l:'Hotel',I:Hotel,c:'bg-blue-500'},{k:'transport',l:'Transport',I:Plane,c:'bg-amber-500'},{k:'activity',l:'Activities',I:Compass,c:'bg-emerald-500'},{k:'food',l:'Food',I:Utensils,c:'bg-red-500'},{k:'shopping',l:'Shopping',I:ShoppingBag,c:'bg-purple-500'},{k:'other',l:'Other',I:DollarSign,c:'bg-slate-400'}];

const Budget=()=>{
const[trips,setTrips]=useState([]);const[tp,setTp]=useState(null);const[budget,setBudget]=useState(null);const[expenses,setExpenses]=useState([]);const[loading,setLoading]=useState(true);
const[showAdd,setShowAdd]=useState(false);const[saving,setSaving]=useState(false);
const[editBudget,setEditBudget]=useState(false);const[budgetInput,setBudgetInput]=useState('');
const[form,setForm]=useState({category:'food',description:'',amount:'',date:new Date().toISOString().slice(0,10)});

useEffect(()=>{loadTrips();},[]);
useEffect(()=>{if(tp){loadBudget(tp._id);setBudgetInput(tp.budget?.total||'');}},[tp]);

const loadTrips=async()=>{try{const{data}=await tripAPI.getAll({});if(data.success&&data.trips.length>0){setTrips(data.trips);setTp(data.trips[0]);}}catch(e){}finally{setLoading(false);}};
const loadBudget=async(id)=>{try{const{data}=await expenseAPI.getBudget(id);if(data.success){setBudget(data);setExpenses(data.expenses);}}catch(e){console.error(e);}};

const handleAdd=async()=>{if(!form.description.trim()||!form.amount)return;setSaving(true);try{
await expenseAPI.add({...form,amount:Number(form.amount),tripId:tp._id});
await loadBudget(tp._id);setShowAdd(false);setForm({category:'food',description:'',amount:'',date:new Date().toISOString().slice(0,10)});
}catch(e){console.error(e);}finally{setSaving(false);}};

const handleDelete=async(id)=>{try{await expenseAPI.delete(id);await loadBudget(tp._id);}catch(e){}};

const saveBudget=async()=>{try{
await tripAPI.update(tp._id,{budget:{total:Number(budgetInput)||0,currency:'INR'}});
const updated={...tp,budget:{...tp.budget,total:Number(budgetInput)||0}};
setTp(updated);setTrips(ts=>ts.map(t=>t._id===tp._id?updated:t));setEditBudget(false);
}catch(e){console.error(e);}};

const total=budget?.grandTotal||0;
const cats=budget?.byCategory||{};
const tripBudget=tp?.budget?.total||0;
const remaining=tripBudget-total;
const pctUsed=tripBudget>0?Math.min(Math.round(total/tripBudget*100),100):0;

if(loading)return<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin"/></div>;

return(
<div className="animate-fade-in max-w-5xl mx-auto">
<div className="flex items-start justify-between mb-6">
<div><h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Budget Dashboard</h1><p className="text-slate-500 mt-1">Track and manage your trip expenses</p></div>
<button onClick={()=>setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700"><Plus className="w-4 h-4"/>Add Expense</button>
</div>

{trips.length>0&&<div className="mb-4"><select value={tp?._id||''} onChange={e=>setTp(trips.find(t=>t._id===e.target.value))} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm">{trips.map(t=><option key={t._id} value={t._id}>{t.title}</option>)}</select></div>}

{/* Set Budget prompt */}
{tripBudget===0&&<div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-xl p-5 mb-6"><AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0"/>
<div className="flex-1"><p className="text-sm font-bold text-slate-900">No budget set for this trip</p><p className="text-xs text-slate-500">Set a budget to track your spending</p></div>
<div className="flex items-center gap-2"><span className="text-sm text-slate-500">₹</span><input value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} type="number" placeholder="50000" className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"/>
<button onClick={saveBudget} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">Set Budget</button></div></div>}

{/* Summary Cards */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
<div className="bg-white rounded-2xl border border-slate-100 p-5">
<p className="text-xs text-slate-400 mb-1">Total Budget</p>
{editBudget?<div className="flex items-center gap-1.5"><span className="text-sm text-slate-400">₹</span><input value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} type="number" className="w-24 px-2 py-1 border border-primary-300 rounded-lg text-lg font-bold"/><button onClick={saveBudget} className="p-1 bg-primary-100 rounded hover:bg-primary-200"><Check className="w-4 h-4 text-primary-600"/></button><button onClick={()=>setEditBudget(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4 text-slate-400"/></button></div>:
<div className="flex items-center gap-2"><p className="text-2xl font-bold text-slate-900">₹ {tripBudget.toLocaleString()}</p><button onClick={()=>{setBudgetInput(tripBudget);setEditBudget(true);}} className="p-1 hover:bg-slate-100 rounded"><Pencil className="w-3.5 h-3.5 text-slate-400"/></button></div>}
</div>
<div className="bg-white rounded-2xl border border-slate-100 p-5"><p className="text-xs text-slate-400 mb-1">Total Spent</p><p className="text-2xl font-bold text-primary-600">₹ {total.toLocaleString()}</p></div>
<div className={`rounded-2xl border p-5 ${remaining>=0?'bg-emerald-50 border-emerald-100':'bg-red-50 border-red-100'}`}><p className="text-xs text-slate-400 mb-1">Remaining</p><p className={`text-2xl font-bold ${remaining>=0?'text-emerald-700':'text-red-600'}`}>₹ {remaining.toLocaleString()}</p></div>
<div className="bg-white rounded-2xl border border-slate-100 p-5"><p className="text-xs text-slate-400 mb-1">Expenses</p><p className="text-2xl font-bold text-slate-900">{expenses.length}</p></div>
</div>

{/* Progress bar */}
{tripBudget>0&&<div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-slate-700">Budget Usage</span><span className={`text-sm font-bold ${pctUsed>=90?'text-red-600':pctUsed>=70?'text-amber-600':'text-emerald-600'}`}>{pctUsed}%</span></div><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${pctUsed>=90?'bg-red-500':pctUsed>=70?'bg-amber-500':'bg-emerald-500'}`} style={{width:`${pctUsed}%`}}/></div></div>}

{remaining<0&&<div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-6"><AlertTriangle className="w-5 h-5 text-red-500"/><p className="text-sm font-semibold text-red-700">You've exceeded your budget by ₹ {Math.abs(remaining).toLocaleString()}</p></div>}

<div className="grid lg:grid-cols-[1fr_320px] gap-6">
{/* Category breakdown */}
<div className="bg-white rounded-2xl border border-slate-100 p-5">
<h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-primary-600"/>Category Breakdown</h3>
<div className="space-y-3">
{CAT_DATA.map(cat=>{const val=cats[cat.k]||0;const pct=total>0?Math.round(val/total*100):0;
return<div key={cat.k} className="flex items-center gap-3">
<div className={`w-8 h-8 ${cat.c} rounded-lg flex items-center justify-center flex-shrink-0`}><cat.I className="w-4 h-4 text-white"/></div>
<div className="flex-1">
<div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-slate-700">{cat.l}</span><span className="text-sm font-bold text-slate-900">₹ {val.toLocaleString()}</span></div>
<div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${cat.c} rounded-full transition-all`} style={{width:`${Math.min(pct,100)}%`}}/></div>
</div>
<span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
</div>;})}
</div>
</div>

{/* Recent expenses */}
<div className="bg-white rounded-2xl border border-slate-100 p-5">
<h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-600"/>Recent Expenses</h3>
{expenses.length===0?<p className="text-sm text-slate-400 text-center py-4">No expenses tracked yet</p>:
<div className="space-y-2 max-h-80 overflow-y-auto">{expenses.slice(0,15).map(e=>{const cat=CAT_DATA.find(c=>c.k===e.category)||CAT_DATA[5];
return<div key={e._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 group">
<div className={`w-7 h-7 ${cat.c} rounded-lg flex items-center justify-center flex-shrink-0`}><cat.I className="w-3.5 h-3.5 text-white"/></div>
<div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-700 truncate">{e.description}</p><p className="text-[10px] text-slate-400">{new Date(e.date).toLocaleDateString()}</p></div>
<span className="text-sm font-bold text-slate-900">₹ {e.amount.toLocaleString()}</span>
<button onClick={()=>handleDelete(e._id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
</div>;})}</div>}
</div>
</div>

{/* ADD EXPENSE MODAL */}
{showAdd&&(<>
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={()=>setShowAdd(false)}/>
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in" onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="text-lg font-bold">Add Expense</h3><button onClick={()=>setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400"/></button></div>
<div className="p-5 space-y-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label><div className="flex flex-wrap gap-2">{CAT_DATA.map(c=><button key={c.k} type="button" onClick={()=>setForm({...form,category:c.k})} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${form.category===c.k?'bg-primary-600 text-white':'bg-slate-100 text-slate-600'}`}><c.I className="w-3.5 h-3.5"/>{c.l}</button>)}</div></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400"/></div>
<div className="grid grid-cols-2 gap-4">
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹) *</label><input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400"/></div>
<div><label className="block text-sm font-semibold text-slate-700 mb-1">Date</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400"/></div>
</div>
</div>
<div className="flex justify-end gap-3 p-5 border-t border-slate-100">
<button onClick={()=>setShowAdd(false)} className="px-5 py-2.5 text-slate-600 text-sm">Cancel</button>
<button onClick={handleAdd} disabled={saving} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60">{saving?'Saving...':'Add Expense'}</button>
</div>
</div></div></>)}
</div>);};
export default Budget;
