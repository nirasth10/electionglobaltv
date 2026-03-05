'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useElection, IElectionRegion, ICandidate } from '@/app/context/ElectionContext';
import { useTicker, ITickerItem } from '@/app/context/TickerContext';
import { useNews, INewsItem } from '@/app/context/NewsContext';
import { useSocket } from '@/app/context/SocketContext';
import Link from 'next/link';
import {
  Monitor, Radio, Plus, Trash2, Pencil, Save, X, LogOut,
  ChevronUp, ChevronDown, Eye, EyeOff, Upload, ImageIcon,
  CheckCircle2, Clock, AlertTriangle, TrendingUp, Wifi, WifiOff,
  RefreshCw, Users, Layers, ToggleLeft, ToggleRight, ArrowLeft, MessageSquare,
} from 'lucide-react';

// ─── Image Upload Helper ───────────────────────────────────────────────────────
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  const { url } = await res.json();
  return url;
}

// ─── Shared: ImageInput ────────────────────────────────────────────────────────
function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'url' | 'upload'>('url');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadImage(file);
      onChange(url);
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1 text-[11px]">
        {(['url', 'upload'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1 rounded font-bold transition mukta-bold ${tab === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {t === 'url' ? '🔗 URL' : '⬆️ Upload'}
          </button>
        ))}
      </div>
      {tab === 'url' ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition placeholder-slate-600"
        />
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full py-2.5 border-2 border-dashed border-white/15 hover:border-blue-500/50 rounded-lg text-slate-400 hover:text-white transition text-sm flex items-center justify-center gap-2 mukta-semibold">
            <Upload size={14} />
            {uploading ? 'Uploading…' : 'Click to pick image'}
          </button>
        </div>
      )}
      {value && (
        <div className="flex items-center gap-2">
          <img src={value} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-white/10" onError={e => (e.currentTarget.style.display = 'none')} />
          <span className="text-[10px] text-slate-500 truncate flex-1">{value}</span>
        </div>
      )}
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; cls: string }> = {
    active: { icon: <CheckCircle2 size={10} />, cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    completed: { icon: <Clock size={10} />, cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    pending: { icon: <AlertTriangle size={10} />, cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mukta-bold ${s.cls}`}>
      {s.icon} {status}
    </span>
  );
}

// ─── Widget Tab ────────────────────────────────────────────────────────────────
function WidgetTab() {
  const { regions, refreshRegions, createRegion, updateRegion, deleteRegion, setDisplayRegion } = useElection();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const selected = regions.find(r => r._id === selectedId) ?? regions[0];

  useEffect(() => {
    if (!selectedId && regions.length > 0) setSelectedId(regions[0]._id);
  }, [regions, selectedId]);

  // Region form state
  const [rForm, setRForm] = useState({ name: '', nepaliName: '', totalCountPercent: 0, status: 'active' as 'active' | 'completed' | 'pending' });
  const [editingRegion, setEditingRegion] = useState<IElectionRegion | null>(null);

  // Candidate form state
  const emptyC = { name: '', party: '', votes: 0, changeVotes: 0, color: '#3b82f6', imageUrl: '', partySymbol: '' };
  const [cForm, setCForm] = useState(emptyC);

  const openEditRegion = (r: IElectionRegion) => {
    setEditingRegion(r);
    setRForm({ name: r.name, nepaliName: r.nepaliName, totalCountPercent: r.totalCountPercent, status: r.status });
    setShowRegionForm(true);
    setShowCandidateForm(false);
  };

  const openAddRegion = () => {
    setEditingRegion(null);
    setRForm({ name: '', nepaliName: '', totalCountPercent: 0, status: 'active' });
    setShowRegionForm(true);
    setShowCandidateForm(false);
  };

  const saveRegion = async () => {
    try {
      setSaving(true);
      if (editingRegion) {
        await updateRegion(editingRegion._id, rForm);
        flash('Region updated ✓');
      } else {
        await createRegion({ ...rForm, candidates: [], isCurrentDisplay: regions.length === 0 });
        flash('Region created ✓');
      }
      setShowRegionForm(false);
      setEditingRegion(null);
    } finally { setSaving(false); }
  };

  const openEditCandidate = (c: ICandidate) => {
    setEditingCandidateId(c._id);
    setCForm({ name: c.name, party: c.party, votes: c.votes, changeVotes: c.changeVotes, color: c.color, imageUrl: c.imageUrl || '', partySymbol: c.partySymbol || '' });
    setShowCandidateForm(true);
    setShowRegionForm(false);
  };

  const openAddCandidate = () => {
    setEditingCandidateId(null);
    setCForm(emptyC);
    setShowCandidateForm(true);
    setShowRegionForm(false);
  };

  const saveCandidate = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      let newCandidates: ICandidate[];
      if (editingCandidateId) {
        newCandidates = selected.candidates.map(c =>
          c._id === editingCandidateId ? { ...c, ...cForm } : c
        );
        flash('Candidate updated ✓');
      } else {
        newCandidates = [...selected.candidates, { ...cForm, _id: `tmp-${Date.now()}` }];
        flash('Candidate added ✓');
      }
      await updateRegion(selected._id, { candidates: newCandidates });
      setShowCandidateForm(false);
      setEditingCandidateId(null);
      setCForm(emptyC);
    } finally { setSaving(false); }
  };

  const deleteCandidate = async (cid: string) => {
    if (!selected || !confirm('Delete this candidate?')) return;
    const newCandidates = selected.candidates.filter(c => c._id !== cid);
    await updateRegion(selected._id, { candidates: newCandidates });
    flash('Candidate deleted');
  };

  const handleDeleteRegion = async (id: string) => {
    if (!confirm('Delete this region and all its candidates?')) return;
    await deleteRegion(id);
    if (selectedId === id) setSelectedId(regions.find(r => r._id !== id)?._id ?? null);
    flash('Region deleted');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Regions list */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mukta-bold flex items-center gap-2">
            <Layers size={14} className="text-blue-400" /> Regions
          </h2>
          {/* <button onClick={openAddRegion}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition mukta-bold">
            <Plus size={12} /> Add
          </button> */}
        </div>

        <div className="space-y-2">
          {regions.map(r => (
            <div key={r._id}
              onClick={() => setSelectedId(r._id)}
              className={`p-3 rounded-xl border cursor-pointer transition group ${selectedId === r._id || (!selectedId && r._id === regions[0]?._id)
                ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/30'
                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm mukta-bold truncate">{r.nepaliName}</p>
                  <p className="text-[11px] text-slate-400">{r.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={r.status} />
                    <span className="text-[10px] text-blue-400 font-bold">{r.totalCountPercent}%</span>
                    {r.isCurrentDisplay && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold mukta-bold">ON AIR</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={e => { e.stopPropagation(); openEditRegion(r); }}
                    className="p-1.5 bg-white/5 hover:bg-blue-600/40 rounded-lg text-slate-400 hover:text-white transition">
                    <Pencil size={12} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteRegion(r._id); }}
                    className="p-1.5 bg-white/5 hover:bg-red-600/40 rounded-lg text-slate-400 hover:text-red-400 transition">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {regions.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm mukta-semibold">
              No regions yet. Add one →
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail panel */}
      <div className="lg:col-span-2 space-y-4">

        {/* Flash message */}
        {msg && (
          <div className="px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-sm font-bold mukta-bold flex items-center gap-2">
            <CheckCircle2 size={14} /> {msg}
          </div>
        )}

        {/* Region Edit Form */}
        {showRegionForm && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white mukta-bold flex items-center gap-2">
                <Monitor size={16} className="text-blue-400" />
                {editingRegion ? 'Edit Region' : 'New Region'}
              </h3>
              <button onClick={() => setShowRegionForm(false)} className="text-slate-500 hover:text-white transition"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">English Name</label>
                <input value={rForm.name} onChange={e => setRForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="Jhapa-5" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Nepali Name</label>
                <input value={rForm.nepaliName} onChange={e => setRForm(p => ({ ...p, nepaliName: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="झापा-५" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Count % (0–100)</label>
                <input type="number" min="0" max="100" step="0.1" value={rForm.totalCountPercent}
                  onChange={e => setRForm(p => ({ ...p, totalCountPercent: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Status</label>
                <select value={rForm.status} onChange={e => setRForm(p => ({ ...p, status: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-[#0a1120] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition">
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            {editingRegion && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="onair" checked={editingRegion.isCurrentDisplay}
                  onChange={async e => {
                    if (e.target.checked) { await setDisplayRegion(editingRegion._id); flash('Set as On-Air ✓'); }
                  }}
                  className="w-4 h-4 accent-blue-500" />
                <label htmlFor="onair" className="text-sm text-slate-300 mukta-semibold cursor-pointer">Set as ON AIR (public display)</label>
              </div>
            )}
            <button onClick={saveRegion} disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 mukta-bold">
              <Save size={14} /> {saving ? 'Saving…' : 'Save Region'}
            </button>
          </div>
        )}

        {/* Candidates panel */}
        {selected && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white mukta-bold flex items-center gap-2">
                  <Users size={15} className="text-purple-400" />
                  Candidates — {selected.nepaliName}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{selected.candidates.length} candidates</p>
              </div>
              <div className="flex gap-2">
                {!selected.isCurrentDisplay && (
                  <button onClick={() => setDisplayRegion(selected._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-bold rounded-lg transition mukta-bold border border-amber-600/40">
                    <Eye size={11} /> Set On-Air
                  </button>
                )}
                {/* <button onClick={openAddCandidate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition mukta-bold">
                  <Plus size={12} /> Add Candidate
                </button> */}
              </div>
            </div>

            {/* Candidate form */}
            {showCandidateForm && (
              <div className="m-4 bg-black/30 border border-white/10 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white mukta-bold">{editingCandidateId ? 'Edit Candidate' : 'New Candidate'}</h4>
                  <button onClick={() => { setShowCandidateForm(false); setEditingCandidateId(null); }} className="text-slate-500 hover:text-white transition"><X size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Full Name (Nepali)</label>
                    <input value={cForm.name} onChange={e => setCForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" placeholder="केपी शर्मा ओली" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party</label>
                    <input value={cForm.party} onChange={e => setCForm(p => ({ ...p, party: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" placeholder="CPN-UML" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party Flag Image</label>
                    <ImageInput value={cForm.partySymbol} onChange={v => setCForm(p => ({ ...p, partySymbol: v }))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Total Votes</label>
                    <input type="number" value={cForm.votes} onChange={e => setCForm(p => ({ ...p, votes: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Vote Change</label>
                    <input type="number" value={cForm.changeVotes} onChange={e => setCForm(p => ({ ...p, changeVotes: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={cForm.color} onChange={e => setCForm(p => ({ ...p, color: e.target.value }))}
                        className="w-10 h-9 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                      <input value={cForm.color} onChange={e => setCForm(p => ({ ...p, color: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Photo</label>
                    <ImageInput value={cForm.imageUrl} onChange={v => setCForm(p => ({ ...p, imageUrl: v }))} />
                  </div>
                </div>
                <button onClick={saveCandidate} disabled={saving}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 mukta-bold">
                  <Save size={14} /> {saving ? 'Saving…' : 'Save Candidate'}
                </button>
              </div>
            )}

            {/* Candidates list */}
            <div className="divide-y divide-white/5">
              {selected.candidates.length === 0 && (
                <div className="px-5 py-8 text-center text-slate-500 text-sm mukta-semibold">No candidates yet. Add one above.</div>
              )}
              {selected.candidates.map(c => (
                <div key={c._id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition group">
                  <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-lg flex-shrink-0" style={{ background: c.color + '22' }}>
                      {c.name.charAt(0)}
                    </div>
                  )}
                  {c.partySymbol && (
                    <img src={c.partySymbol} alt={c.party} className="w-6 h-6 rounded-full object-cover border border-white/10 sm:hidden md:block flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm mukta-bold truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.party}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-white text-base mukta-extrabold tabular-nums">{c.votes.toLocaleString()}</p>
                    <p className="text-[11px] text-emerald-400 font-bold">▲ {c.changeVotes}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button onClick={() => openEditCandidate(c)}
                      className="p-1.5 bg-white/5 hover:bg-blue-600/40 rounded-lg text-slate-400 hover:text-white transition">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => deleteCandidate(c._id)}
                      className="p-1.5 bg-white/5 hover:bg-red-600/40 rounded-lg text-slate-400 hover:text-red-400 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ticker Tab ────────────────────────────────────────────────────────────────
function TickerTab() {
  const { items, createItem, updateItem, deleteItem } = useTicker();
  const { regions } = useElection();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const empty = { label: 'LIVE', region: '', party: '', votes: 0, changeVotes: 0, color: '#3b82f6', imageUrl: '', isActive: true };
  const [form, setForm] = useState(empty);

  const openEdit = (item: ITickerItem) => {
    setEditingId(item._id);
    setForm({ label: item.label, region: item.region, party: item.party, votes: item.votes, changeVotes: item.changeVotes, color: item.color, imageUrl: item.imageUrl || '', isActive: item.isActive });
    setShowForm(true);
  };

  const openAdd = () => { setEditingId(null); setForm(empty); setShowForm(true); };

  const save = async () => {
    try {
      setSaving(true);
      if (editingId) { await updateItem(editingId, form); flash('Updated ✓'); }
      else { await createItem(form); flash('Added ✓'); }
      setShowForm(false);
      setEditingId(null);
    } finally { setSaving(false); }
  };

  const moveOrder = async (item: ITickerItem, dir: -1 | 1) => {
    const newOrder = item.order + dir;
    const swap = items.find(i => i.order === newOrder);
    if (swap) await updateItem(swap._id, { order: item.order });
    await updateItem(item._id, { order: newOrder });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mukta-bold flex items-center gap-2">
          <Radio size={14} className="text-cyan-400" />
          Ticker Items
          <span className="ml-1 text-[11px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">{items.length} total · {items.filter(i => i.isActive).length} active</span>
        </h2>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition mukta-bold">
          <Plus size={12} /> Add Item
        </button>
      </div>

      {msg && (
        <div className="px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-sm font-bold mukta-bold flex items-center gap-2">
          <CheckCircle2 size={14} /> {msg}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white mukta-bold flex items-center gap-2">
              <Radio size={15} className="text-cyan-400" />
              {editingId ? 'Edit Ticker Item' : 'New Ticker Item'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-500 hover:text-white transition"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Label (e.g. LIVE)</label>
              <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Region</label>
              <select
                value={form.region}
                onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                className="w-full px-3 py-2 bg-[#0a1120] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="" disabled>— Select a region —</option>
                {regions.map(r => (
                  <option key={r._id} value={r.nepaliName}>
                    {r.nepaliName} ({r.name})
                  </option>
                ))}
              </select>
            </div>
            {/* Auto-fill candidate from selected region */}
            {form.region && regions.find(r => r.nepaliName === form.region) && (
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Auto-fill from Candidate</label>
                <select
                  onChange={e => {
                    const candidate = regions
                      .find(r => r.nepaliName === form.region)
                      ?.candidates.find(c => c._id === e.target.value);
                    if (candidate) {
                      setForm(p => ({
                        ...p,
                        party: candidate.party,
                        color: candidate.color,
                        votes: candidate.votes,
                        changeVotes: candidate.changeVotes,
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#0a1120] border border-cyan-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value="">— Pick a candidate to auto-fill —</option>
                  {regions
                    .find(r => r.nepaliName === form.region)
                    ?.candidates.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.party})
                      </option>
                    ))
                  }
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party</label>
              <input value={form.party} onChange={e => setForm(p => ({ ...p, party: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition" placeholder="CPN-UML" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  className="w-10 h-9 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                <input value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Votes</label>
              <input type="number" value={form.votes} onChange={e => setForm(p => ({ ...p, votes: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Vote Change</label>
              <input type="number" value={form.changeVotes} onChange={e => setForm(p => ({ ...p, changeVotes: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party Flag Image (optional)</label>
              <ImageInput value={form.imageUrl} onChange={v => setForm(p => ({ ...p, imageUrl: v }))} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="tactive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 accent-cyan-500" />
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Show in ticker</label>
            </div>
          </div>
          <button onClick={save} disabled={saving}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 mukta-bold">
            <Save size={14} /> {saving ? 'Saving…' : 'Save Item'}
          </button>
        </div>
      )}

      {/* Items list */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm mukta-semibold">No ticker items yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {[...items].sort((a, b) => a.order - b.order).map((item, idx) => (
              <div key={item._id} className={`px-5 py-3.5 flex items-center gap-3 transition group ${item.isActive ? 'hover:bg-white/[0.02]' : 'opacity-50 hover:opacity-75'}`}>
                {/* Order controls */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button onClick={() => moveOrder(item, -1)} disabled={idx === 0}
                    className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition"><ChevronUp size={12} /></button>
                  <button onClick={() => moveOrder(item, 1)} disabled={idx === items.length - 1}
                    className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition"><ChevronDown size={12} /></button>
                </div>

                <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />

                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.party} className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold bg-white/10 text-slate-300 px-1.5 py-0.5 rounded mukta-bold">{item.label}</span>
                    <span className="font-bold text-white text-sm mukta-bold truncate">{item.party}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mukta-semibold">{item.region}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-black text-white text-sm mukta-extrabold tabular-nums">{item.votes.toLocaleString()}</p>
                  <p className="text-[11px] text-emerald-400 font-bold">▲ {item.changeVotes}</p>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => updateItem(item._id, { isActive: !item.isActive })}
                    className={`p-1.5 rounded-lg transition ${item.isActive ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                    {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="p-1.5 bg-white/5 hover:bg-blue-600/40 rounded-lg text-slate-400 hover:text-white transition opacity-0 group-hover:opacity-100">
                    <Pencil size={12} />
                  </button>
                  <button onClick={async () => { if (confirm('Delete this ticker item?')) { await deleteItem(item._id); flash('Deleted'); } }}
                    className="p-1.5 bg-white/5 hover:bg-red-600/40 rounded-lg text-slate-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── News Tab ────────────────────────────────────────────────────────────────
function NewsTab() {
  const { items, createItem, updateItem, deleteItem } = useNews();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const [text, setText] = useState('');
  const [isActive, setIsActive] = useState(true);

  const openEdit = (item: INewsItem) => {
    setEditingId(item._id);
    setText(item.text);
    setIsActive(item.isActive);
    setShowForm(true);
  };

  const openAdd = () => { setEditingId(null); setText(''); setIsActive(true); setShowForm(true); };

  const save = async () => {
    if (!text.trim()) return;
    try {
      setSaving(true);
      if (editingId) { await updateItem(editingId, { text, isActive }); flash('Updated ✓'); }
      else { await createItem({ text, isActive }); flash('Added ✓'); }
      setShowForm(false);
      setEditingId(null);
    } finally { setSaving(false); }
  };

  const moveOrder = async (item: INewsItem, dir: -1 | 1) => {
    const newOrder = item.order + dir;
    const swap = items.find(i => i.order === newOrder);
    if (swap) await updateItem(swap._id, { order: item.order });
    await updateItem(item._id, { order: newOrder });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mukta-bold flex items-center gap-2">
          <MessageSquare size={14} className="text-red-400" />
          Breaking News
          <span className="ml-1 text-[11px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">{items.length} total · {items.filter(i => i.isActive).length} active</span>
        </h2>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition mukta-bold">
          <Plus size={12} /> Add News
        </button>
      </div>

      {msg && (
        <div className="px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-sm font-bold mukta-bold flex items-center gap-2">
          <CheckCircle2 size={14} /> {msg}
        </div>
      )}

      {showForm && (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white mukta-bold flex items-center gap-2">
              <MessageSquare size={15} className="text-red-400" />
              {editingId ? 'Edit Breaking News' : 'New Breaking News'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-500 hover:text-white transition"><X size={16} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Headline</label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
                placeholder="Type breaking news here..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="nactive" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-red-500 rounded" />
              <label htmlFor="nactive" className="text-sm text-slate-300 mukta-semibold cursor-pointer">Show in ticker</label>
            </div>
          </div>
          <button onClick={save} disabled={saving}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 mukta-bold">
            <Save size={14} /> {saving ? 'Saving…' : 'Save News'}
          </button>
        </div>
      )}

      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm mukta-semibold">No news items yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {[...items].sort((a, b) => a.order - b.order).map((item, idx) => (
              <div key={item._id} className={`px-5 py-3.5 flex items-center gap-3 transition group ${item.isActive ? 'hover:bg-white/[0.02]' : 'opacity-50 hover:opacity-75'}`}>
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button onClick={() => moveOrder(item, -1)} disabled={idx === 0}
                    className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition"><ChevronUp size={12} /></button>
                  <button onClick={() => moveOrder(item, 1)} disabled={idx === items.length - 1}
                    className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition"><ChevronDown size={12} /></button>
                </div>

                <div className="w-1.5 h-10 rounded-full flex-shrink-0 bg-red-500" />

                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-white text-sm mukta-semibold leading-snug">{item.text}</p>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => updateItem(item._id, { isActive: !item.isActive })}
                    className={`p-1.5 rounded-lg transition ${item.isActive ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                    {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="p-1.5 bg-white/5 hover:bg-red-600/40 rounded-lg text-slate-400 hover:text-white transition opacity-0 group-hover:opacity-100">
                    <Pencil size={12} />
                  </button>
                  <button onClick={async () => { if (confirm('Delete this news?')) { await deleteItem(item._id); flash('Deleted'); } }}
                    className="p-1.5 bg-white/5 hover:bg-red-600/40 rounded-lg text-slate-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const { regions, refreshRegions } = useElection();
  const { items: tickerItems, refreshTicker } = useTicker();
  const { items: newsItems, refreshNews } = useNews();
  const { connected, socketUnavailable } = useSocket();
  const isLive = connected || socketUnavailable;
  const [tab, setTab] = useState<'widget' | 'ticker' | 'news'>('widget');
  const [reseeding, setReseeding] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
          <p className="mukta-semibold text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const reseed = async () => {
    if (!confirm('This will wipe and re-seed the database. Continue?')) return;
    setReseeding(true);
    await fetch('/api/seed', { method: 'DELETE' });
    await refreshRegions();
    await refreshTicker();
    await refreshNews();
    setReseeding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060c18] via-slate-900 to-black text-white font-sans mukta-regular">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a1120]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition">
              <ArrowLeft size={16} />
              <span className="text-lg font-black mukta-extrabold hidden sm:block">⚡ Election 2026</span>
            </Link>
            <div className="hidden sm:block w-px h-5 bg-white/10" />
            <span className="text-sm text-slate-400 mukta-semibold hidden sm:block">Admin Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-bold mukta-bold ${isLive ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400' : 'bg-red-600/20 border-red-500/40 text-red-400'}`}>
              {isLive ? <Wifi size={11} /> : <WifiOff size={11} />}
              <span className="hidden sm:inline">{connected ? 'Live Connected' : socketUnavailable ? 'Live (Polling)' : 'Disconnected'}</span>
            </div>

            {/* Reseed 
            <button onClick={reseed} disabled={reseeding}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition" title="Re-seed database">
              <RefreshCw size={14} className={reseeding ? 'animate-spin' : ''} />
            </button> */}

            <button onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg transition border border-red-600/30 mukta-bold">
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { label: 'Regions', value: regions.length, color: 'text-blue-400' },
            { label: 'On Air', value: regions.filter(r => r.isCurrentDisplay).length, color: 'text-amber-400' },
            { label: 'Total Candidates', value: regions.reduce((s, r) => s + r.candidates.length, 0), color: 'text-purple-400' },
            { label: 'Ticker Items', value: tickerItems.length, color: 'text-cyan-400' },
            { label: 'Breaking News', value: newsItems.length, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xl font-black mukta-extrabold tabular-nums ${s.color}`}>{s.value}</span>
              <span className="text-[11px] text-slate-500 mukta-semibold">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/10 bg-[#0a1120]/60 backdrop-blur sticky top-[57px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 py-2">
            {([
              { id: 'widget', label: 'Election Widget', icon: <Monitor size={14} />, color: 'blue' },
              { id: 'ticker', label: 'Ticker Bar', icon: <Radio size={14} />, color: 'cyan' },
              { id: 'news', label: 'Breaking News', icon: <MessageSquare size={14} />, color: 'red' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition mukta-bold ${tab === t.id
                  ? t.color === 'blue' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : t.color === 'cyan' ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                      : 'bg-red-600/30 text-red-300 border border-red-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {tab === 'widget' ? <WidgetTab /> : tab === 'ticker' ? <TickerTab /> : <NewsTab />}
      </main>
    </div>
  );
}
