import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { noteAPI, tripAPI } from '../../services/api';
import { StickyNote, Plus, Trash2, Pencil, X, Loader2 } from 'lucide-react';

const COLORS = ['#FEF3C7', '#DBEAFE', '#FCE7F3', '#D1FAE5', '#EDE9FE', '#FEE2E2'];

const Notes = () => {
  const { tripId: paramTripId } = useParams();
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState(paramTripId || null);
  const [trip, setTrip] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'general', color: COLORS[0] });

  // Load trips list if no tripId from params
  useEffect(() => {
    if (!paramTripId) {
      loadTrips();
    } else {
      setTripId(paramTripId);
    }
  }, [paramTripId]);

  useEffect(() => {
    if (tripId) { loadTrip(); loadNotes(); }
  }, [tripId]);

  const loadTrips = async () => {
    try {
      const { data } = await tripAPI.getAll({});
      if (data.success && data.trips.length > 0) {
        setTrips(data.trips);
        setTripId(data.trips[0]._id);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadTrip = async () => {
    try {
      const { data } = await tripAPI.getOne(tripId);
      if (data.success) setTrip(data.trip);
    } catch (e) { console.error(e); }
  };

  const loadNotes = async () => {
    setLoading(true);
    try {
      const { data } = await noteAPI.getByTrip(tripId);
      if (data.success) setNotes(data.notes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.content.trim()) return;
    setSaving(true);
    try {
      if (editNote) await noteAPI.update(editNote._id, { ...form, tripId });
      else await noteAPI.add({ ...form, tripId });
      await loadNotes();
      setShowModal(false);
      setEditNote(null);
      setForm({ title: '', content: '', type: 'general', color: COLORS[0] });
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try { await noteAPI.delete(id); await loadNotes(); } catch (e) { console.error(e); }
  };

  const openEdit = (n) => {
    setEditNote(n);
    setForm({ title: n.title || '', content: n.content, type: n.type || 'general', color: n.color || COLORS[0] });
    setShowModal(true);
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;

  if (!tripId && trips.length === 0) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto text-center py-20">
        <StickyNote className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No trips yet</h2>
        <p className="text-slate-500 mb-4">Create a trip first to start adding notes.</p>
        <Link to="/dashboard/trips/new" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" />Create Trip
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link to="/dashboard/trips" className="text-sm text-slate-400 hover:text-primary-600 mb-2 inline-block">← Back to My Trips</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Trip Notes</h1>
          <p className="text-slate-500 mt-1">{trip?.title || 'Trip'}</p>
        </div>
        <button
          onClick={() => { setEditNote(null); setForm({ title: '', content: '', type: 'general', color: COLORS[0] }); setShowModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />Add Note
        </button>
      </div>

      {/* Trip selector */}
      {trips.length > 1 && (
        <div className="mb-4">
          <select value={tripId || ''} onChange={e => setTripId(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm">
            {trips.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
          </select>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <StickyNote className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No notes yet. Add your first note!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => (
            <div key={n._id} style={{ backgroundColor: n.color || COLORS[0] }} className="rounded-2xl p-5 group hover:shadow-md transition-shadow relative">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                <button onClick={() => openEdit(n)} className="p-1.5 bg-white/80 rounded-lg hover:bg-white"><Pencil className="w-3.5 h-3.5 text-slate-600" /></button>
                <button onClick={() => handleDelete(n._id)} className="p-1.5 bg-white/80 rounded-lg hover:bg-white"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
              </div>
              {n.title && <h3 className="text-sm font-bold text-slate-900 mb-2">{n.title}</h3>}
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{n.content}</p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
                <span className="text-[10px] text-slate-500 capitalize px-2 py-0.5 bg-white/50 rounded">{n.type}</span>
                <span className="text-[10px] text-slate-500">{fmt(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NOTE MODAL */}
      {showModal && (<>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold">{editNote ? 'Edit Note' : 'Add Note'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Content *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <option value="general">General</option>
                  <option value="day">Day Note</option>
                  <option value="city">City Note</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} style={{ backgroundColor: c }}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === c ? 'border-primary-600 scale-110' : 'border-transparent'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.content.trim()} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                {saving ? 'Saving...' : editNote ? 'Update' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      </>)}
    </div>
  );
};

export default Notes;
