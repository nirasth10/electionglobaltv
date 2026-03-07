'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useElection, IElectionRegion, ICandidate } from '@/app/context/ElectionContext';
import { useLeftElection, ILeftElectionRegion, ILeftCandidate } from '@/app/context/LeftElectionContext';
import { useTicker, ITickerItem } from '@/app/context/TickerContext';
import { useNews, INewsItem } from '@/app/context/NewsContext';
import { useNewsMarquee, INewsMarqueeItem } from '@/app/context/NewsMarqueeContext';
import { useSocket } from '@/app/context/SocketContext';
import Link from 'next/link';
import {
  Monitor, Radio, Plus, Trash2, Pencil, Save, X, LogOut,
  ChevronUp, ChevronDown, Eye, EyeOff, Upload, ImageIcon,
  CheckCircle2, Clock, AlertTriangle, TrendingUp, Wifi, WifiOff,
  RefreshCw, Users, Layers, ToggleLeft, ToggleRight, ArrowLeft, MessageSquare,
} from 'lucide-react';
import { formatNepaliVotes, parseNepaliInt, toNepali } from '@/app/lib/nepali';

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

// ─── Left Widget Tab ────────────────────────────────────────────────────────────
function LeftWidgetTab() {
  const { leftRegions: regions, refreshLeftRegions: refreshRegions, createRegion, updateRegion, deleteRegion, setDisplayRegion } = useLeftElection();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const [editableRegions, setEditableRegions] = useState<ILeftElectionRegion[]>([]);
  useEffect(() => { setEditableRegions(regions); }, [regions]);
  const hasChanges = useMemo(() => JSON.stringify(editableRegions) !== JSON.stringify(regions), [editableRegions, regions]);
  const selected = editableRegions.find(r => r._id === selectedId) ?? editableRegions[0];
  useEffect(() => { if (!selectedId && editableRegions.length > 0) setSelectedId(editableRegions[0]._id); }, [editableRegions, selectedId]);
  const [newRegionForm, setNewRegionForm] = useState({ name: '', nepaliName: '', totalCountPercent: '' as any, showWidget: true, status: 'active' as 'active' | 'completed' | 'pending' });
  const [showNewRegionForm, setShowNewRegionForm] = useState(false);
  const emptyC = { name: '', party: '', votes: 0, changeVotes: 0, color: '#3b82f6', imageUrl: '', partySymbol: '', isElected: false };
  const [newCandidateForm, setNewCandidateForm] = useState(emptyC);
  const [showNewCandidateForm, setShowNewCandidateForm] = useState(false);
  const handleRegionChange = (id: string, field: keyof ILeftElectionRegion, value: any) => {
    setEditableRegions(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));
  };
  const handleCandidateChange = (regionId: string, candidateId: string, field: keyof ILeftCandidate, value: any) => {
    setEditableRegions(prev => prev.map(r =>
      r._id === regionId ? { ...r, candidates: r.candidates.map((c: ILeftCandidate) => c._id === candidateId ? { ...c, [field]: value } : c) } : r
    ));
  };
  const addCandidateToRegion = (regionId: string) => {
    if (!newCandidateForm.name || !newCandidateForm.party) { flash('Name and party are required.'); return; }
    const tempId = `new-${Date.now()}-${Math.random()}`;
    setEditableRegions(prev => prev.map(r =>
      r._id === regionId ? { ...r, candidates: [...r.candidates, { ...newCandidateForm, _id: tempId }] } : r
    ));
    setNewCandidateForm(emptyC); setShowNewCandidateForm(false);
    flash('Candidate added. Hit Save All to persist.');
  };
  const deleteCandidateFromRegion = (regionId: string, candidateId: string) => {
    if (!confirm('Remove this candidate?')) return;
    setEditableRegions(prev => prev.map(r =>
      r._id === regionId ? { ...r, candidates: r.candidates.filter((c: ILeftCandidate) => c._id !== candidateId) } : r
    ));
    flash('Candidate removed. Hit Save All to persist.');
  };
  const addRegion = () => {
    if (!newRegionForm.name || !newRegionForm.nepaliName) { flash('Names are required.'); return; }
    const tempId = `new-${Date.now()}-${Math.random()}`;
    setEditableRegions(prev => [...prev, { ...newRegionForm, _id: tempId, candidates: [], isCurrentDisplay: false, lastUpdated: new Date().toISOString() } as unknown as ILeftElectionRegion]);
    setNewRegionForm({ name: '', nepaliName: '', totalCountPercent: '' as any, showWidget: true, status: 'active' });
    setShowNewRegionForm(false); flash('Region added. Hit Save All to persist.');
  };
  const deleteRegionFromList = (id: string) => {
    if (!confirm('Delete this region and all its candidates?')) return;
    setEditableRegions(prev => prev.filter(r => r._id !== id));
    if (selectedId === id) setSelectedId(editableRegions.find(r => r._id !== id)?._id ?? null);
    flash('Region removed. Hit Save All to persist.');
  };
  const saveAllChanges = async () => {
    setSaving(true);
    try {
      for (const er of editableRegions) {
        const orig = regions.find(r => r._id === er._id);
        if (!orig) {
          await createRegion({ name: er.name, nepaliName: er.nepaliName, totalCountPercent: er.totalCountPercent, showWidget: er.showWidget, status: er.status, candidates: er.candidates.map(({ _id, ...rest }: any) => rest) as any, isCurrentDisplay: er.isCurrentDisplay });
        } else {
          const changes: Partial<ILeftElectionRegion> = {};
          if (er.name !== orig.name) changes.name = er.name;
          if (er.nepaliName !== orig.nepaliName) changes.nepaliName = er.nepaliName;
          if (er.totalCountPercent !== orig.totalCountPercent) changes.totalCountPercent = er.totalCountPercent;
          if (er.showWidget !== orig.showWidget) changes.showWidget = er.showWidget;
          if (er.status !== orig.status) changes.status = er.status;
          const candidatesChanged = er.candidates.length !== orig.candidates.length ||
            er.candidates.some((ec: ILeftCandidate) => { const oc = orig.candidates.find((c: ILeftCandidate) => c._id === ec._id); return !oc || JSON.stringify(ec) !== JSON.stringify(oc); });
          if (Object.keys(changes).length > 0 || candidatesChanged) {
            const candidatesToSave = er.candidates.map((c: ILeftCandidate) => c._id?.startsWith('new-') ? (({ _id, ...rest }) => rest)(c) : c) as any;
            await updateRegion(er._id, { ...changes, candidates: candidatesToSave });
          }
        }
      }
      for (const orig of regions) {
        if (!editableRegions.some(r => r._id === orig._id)) await deleteRegion(orig._id);
      }
      flash('All changes saved ✓'); refreshRegions();
    } catch { flash('Failed to save changes.'); } finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mukta-bold flex items-center gap-2"><Layers size={14} className="text-blue-400" /> Regions</h2>
          <button onClick={() => setShowNewRegionForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition mukta-bold"><Plus size={12} /> Add</button>
        </div>
        {showNewRegionForm && (
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white mukta-bold">New Region</h4>
              <button onClick={() => setShowNewRegionForm(false)} className="text-slate-500 hover:text-white transition"><X size={14} /></button>
            </div>
            <input value={newRegionForm.name} onChange={e => setNewRegionForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="English name" />
            <input value={newRegionForm.nepaliName} onChange={e => setNewRegionForm(p => ({ ...p, nepaliName: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="नेपाली नाम" />
            <button onClick={addRegion} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition mukta-bold">Add Region</button>
          </div>
        )}
        <div className="space-y-2">
          {editableRegions.map((r: ILeftElectionRegion) => (
            <div key={r._id} onClick={() => setSelectedId(r._id)}
              className={`p-3 rounded-xl border cursor-pointer transition group ${(selectedId === r._id || (!selectedId && r._id === editableRegions[0]?._id)) ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/30' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm mukta-bold truncate">{r.nepaliName}</p>
                  <p className="text-[11px] text-slate-400">{r.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={r.status} />
                    <span className="text-[10px] text-blue-400 font-bold">{r.totalCountPercent}%</span>
                    {r.isCurrentDisplay && <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold mukta-bold">ON AIR</span>}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteRegionFromList(r._id); }} className="p-1.5 bg-white/5 hover:bg-red-600/40 rounded-lg text-slate-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {editableRegions.length === 0 && <div className="text-center py-8 text-slate-500 text-sm mukta-semibold">No regions yet. Add one →</div>}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {msg && <div className="px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-sm font-bold mukta-bold flex items-center gap-2"><CheckCircle2 size={14} />{msg}</div>}
        <button onClick={saveAllChanges} disabled={saving || !hasChanges}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 text-white font-black rounded-xl transition flex items-center justify-center gap-2 mukta-bold text-sm shadow-lg shadow-blue-900/30">
          <Save size={16} />{saving ? 'Saving all changes…' : '💾 Save All Changes'}
        </button>
        {selected && (
          <>
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white mukta-bold flex items-center gap-2"><Monitor size={16} className="text-blue-400" />Region Details</h3>
                {selected.isCurrentDisplay
                  ? <span className="text-[11px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-full font-bold mukta-bold">🔴 ON AIR</span>
                  : <button onClick={() => setDisplayRegion(selected._id).then(() => flash('Set as On-Air ✓'))} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-bold rounded-lg transition mukta-bold border border-amber-600/40"><Eye size={11} />Set On-Air</button>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">English Name</label><input value={selected.name} onChange={e => handleRegionChange(selected._id, 'name', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" /></div>
                <div><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Nepali Name</label><input value={selected.nepaliName} onChange={e => handleRegionChange(selected._id, 'nepaliName', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" /></div>
                <div><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Count / %</label><input value={selected.totalCountPercent ?? ''} onChange={e => handleRegionChange(selected._id, 'totalCountPercent', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="45% or Counting" /></div>
                <div><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Status</label>
                  <select value={selected.status} onChange={e => handleRegionChange(selected._id, 'status', e.target.value as any)} className="w-full px-3 py-2 bg-[#0a1120] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition">
                    <option value="pending">Pending</option><option value="active">Active</option><option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id={`lw_show_${selected._id}`} checked={selected.showWidget ?? true} onChange={e => handleRegionChange(selected._id, 'showWidget', e.target.checked)} className="w-4 h-4 accent-blue-500" />
                <label htmlFor={`lw_show_${selected._id}`} className="text-sm text-slate-300 mukta-semibold cursor-pointer">Show Election Widget on UI</label>
              </div>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white mukta-bold flex items-center gap-2"><Users size={15} className="text-purple-400" />Candidates — {selected.nepaliName}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selected.candidates.length} candidates · edit inline</p>
                </div>
                <button onClick={() => setShowNewCandidateForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition mukta-bold"><Plus size={12} />Add Candidate</button>
              </div>
              {showNewCandidateForm && (
                <div className="m-4 bg-black/30 border border-white/10 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white mukta-bold">New Candidate</h4>
                    <button onClick={() => { setShowNewCandidateForm(false); setNewCandidateForm(emptyC); }} className="text-slate-500 hover:text-white transition"><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Full Name</label><input value={newCandidateForm.name} onChange={e => setNewCandidateForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" placeholder="केपी शर्मा ओली" /></div>
                    <div><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party</label><input value={newCandidateForm.party} onChange={e => setNewCandidateForm(p => ({ ...p, party: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" placeholder="CPN-UML" /></div>
                    <div><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Color</label><div className="flex gap-2"><input type="color" value={newCandidateForm.color} onChange={e => setNewCandidateForm(p => ({ ...p, color: e.target.value }))} className="w-9 h-9 rounded border border-white/10 cursor-pointer bg-transparent" /><input value={newCandidateForm.color} onChange={e => setNewCandidateForm(p => ({ ...p, color: e.target.value }))} className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none" /></div></div>
                    <div><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Votes</label><input type="text" inputMode="numeric" value={toNepali(newCandidateForm.votes)} onChange={e => setNewCandidateForm(p => ({ ...p, votes: parseNepaliInt(e.target.value) }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold" placeholder="०" /></div>
                    <div><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Vote Change</label><input type="text" inputMode="numeric" value={toNepali(newCandidateForm.changeVotes)} onChange={e => setNewCandidateForm(p => ({ ...p, changeVotes: parseNepaliInt(e.target.value) }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold" placeholder="०" /></div>
                    <div className="col-span-2"><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party Flag Image</label><ImageInput value={newCandidateForm.partySymbol} onChange={v => setNewCandidateForm(p => ({ ...p, partySymbol: v }))} /></div>
                    <div className="col-span-2"><label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Photo</label><ImageInput value={newCandidateForm.imageUrl} onChange={v => setNewCandidateForm(p => ({ ...p, imageUrl: v }))} /></div>
                    <div className="col-span-2 flex items-center gap-2"><input type="checkbox" checked={newCandidateForm.isElected || false} onChange={e => setNewCandidateForm(p => ({ ...p, isElected: e.target.checked }))} className="w-4 h-4 accent-purple-500" /><label className="text-sm font-bold text-slate-300 mukta-bold cursor-pointer">Mark as Elected (Winner)</label></div>
                  </div>
                  <button onClick={() => addCandidateToRegion(selected._id)} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 mukta-bold"><Plus size={14} />Add Candidate</button>
                </div>
              )}
              <div className="divide-y divide-white/5">
                {selected.candidates.length === 0 && <div className="px-5 py-8 text-center text-slate-500 text-sm mukta-semibold">No candidates yet.</div>}
                {selected.candidates.map((c: ILeftCandidate, idx: number) => (
                  <div key={c._id} className="p-4 space-y-3 hover:bg-white/[0.02] transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.color }} />
                        <span className="text-xs font-bold text-slate-400 mukta-bold">#{idx + 1}</span>
                        {c.imageUrl && <img src={c.imageUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-white/10" />}
                      </div>
                      <button onClick={() => deleteCandidateFromRegion(selected._id, c._id)} className="p-1.5 bg-white/5 hover:bg-red-600/40 rounded-lg text-slate-500 hover:text-red-400 transition"><Trash2 size={12} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2"><label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Full Name</label><input value={c.name} onChange={e => handleCandidateChange(selected._id, c._id, 'name', e.target.value)} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold" /></div>
                      <div><label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Party</label><input value={c.party} onChange={e => handleCandidateChange(selected._id, c._id, 'party', e.target.value)} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" /></div>
                      <div><label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Color</label><div className="flex gap-1 items-center"><input type="color" value={c.color} onChange={e => handleCandidateChange(selected._id, c._id, 'color', e.target.value)} className="w-9 h-8 rounded border border-white/10 cursor-pointer bg-transparent flex-shrink-0" /><input value={c.color} onChange={e => handleCandidateChange(selected._id, c._id, 'color', e.target.value)} className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500" /></div></div>
                      <div><label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Total Votes</label><input type="text" inputMode="numeric" value={toNepali(c.votes)} onChange={e => handleCandidateChange(selected._id, c._id, 'votes', parseNepaliInt(e.target.value))} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold" /></div>
                      <div><label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Vote Change</label><input type="text" inputMode="numeric" value={toNepali(c.changeVotes)} onChange={e => handleCandidateChange(selected._id, c._id, 'changeVotes', parseNepaliInt(e.target.value))} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold" /></div>
                      <div><label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Photo URL</label><input value={c.imageUrl || ''} onChange={e => handleCandidateChange(selected._id, c._id, 'imageUrl', e.target.value)} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500 transition" placeholder="https://..." /></div>
                      <div><label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Party Flag URL</label><input value={c.partySymbol || ''} onChange={e => handleCandidateChange(selected._id, c._id, 'partySymbol', e.target.value)} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500 transition" placeholder="https://..." /></div>
                      <div className="col-span-2 flex items-center gap-2 mt-2"><input type="checkbox" id={`elected-${c._id}`} checked={c.isElected || false} onChange={e => handleCandidateChange(selected._id, c._id, 'isElected', e.target.checked)} className="w-4 h-4 accent-purple-500" /><label htmlFor={`elected-${c._id}`} className="text-xs font-bold text-amber-400 mukta-bold cursor-pointer">🏆 Mark as Elected (Winner)</label></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


function WidgetTab() {
  const { regions, refreshRegions, createRegion, updateRegion, deleteRegion, setDisplayRegion } = useElection();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  // State for all regions and their candidates, for inline editing
  const [editableRegions, setEditableRegions] = useState<IElectionRegion[]>([]);
  useEffect(() => {
    setEditableRegions(regions);
  }, [regions]);

  // Track changes to enable/disable Save All button
  const hasChanges = useMemo(() => {
    return JSON.stringify(editableRegions) !== JSON.stringify(regions);
  }, [editableRegions, regions]);

  const selected = editableRegions.find(r => r._id === selectedId) ?? editableRegions[0];

  useEffect(() => {
    if (!selectedId && editableRegions.length > 0) setSelectedId(editableRegions[0]._id);
  }, [editableRegions, selectedId]);

  // Region form state (for adding new region)
  const [newRegionForm, setNewRegionForm] = useState({ name: '', nepaliName: '', totalCountPercent: '' as any, showWidget: true, status: 'active' as 'active' | 'completed' | 'pending' });
  const [showNewRegionForm, setShowNewRegionForm] = useState(false);

  // Candidate form state (for adding new candidate)
  const emptyC = { name: '', party: '', votes: 0, changeVotes: 0, color: '#3b82f6', imageUrl: '', partySymbol: '', isElected: false };
  const [newCandidateForm, setNewCandidateForm] = useState(emptyC);
  const [showNewCandidateForm, setShowNewCandidateForm] = useState(false);

  const handleRegionChange = (id: string, field: keyof IElectionRegion, value: any) => {
    setEditableRegions(prev => prev.map(r =>
      r._id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleCandidateChange = (regionId: string, candidateId: string, field: keyof ICandidate, value: any) => {
    setEditableRegions(prev => prev.map(r =>
      r._id === regionId
        ? {
          ...r,
          candidates: r.candidates.map(c =>
            c._id === candidateId ? { ...c, [field]: value } : c
          )
        }
        : r
    ));
  };

  const addCandidateToRegion = (regionId: string) => {
    if (!newCandidateForm.name || !newCandidateForm.party) {
      flash('Candidate name and party are required.');
      return;
    }
    const tempId = `new-${Date.now()}-${Math.random()}`; // Temporary ID for new candidates
    setEditableRegions(prev => prev.map(r =>
      r._id === regionId
        ? { ...r, candidates: [...r.candidates, { ...newCandidateForm, _id: tempId }] }
        : r
    ));
    setNewCandidateForm(emptyC);
    setShowNewCandidateForm(false);
    flash('Candidate added locally. Save All Changes to persist.');
  };

  const deleteCandidateFromRegion = (regionId: string, candidateId: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    setEditableRegions(prev => prev.map(r =>
      r._id === regionId
        ? { ...r, candidates: r.candidates.filter(c => c._id !== candidateId) }
        : r
    ));
    flash('Candidate deleted locally. Save All Changes to persist.');
  };

  const addRegion = () => {
    if (!newRegionForm.name || !newRegionForm.nepaliName) {
      flash('Region English and Nepali names are required.');
      return;
    }
    const tempId = `new-${Date.now()}-${Math.random()}`; // Temporary ID for new regions
    setEditableRegions(prev => [...prev, { ...newRegionForm, _id: tempId, candidates: [], isCurrentDisplay: false, lastUpdated: new Date().toISOString() } as unknown as IElectionRegion]);
    setNewRegionForm({ name: '', nepaliName: '', totalCountPercent: '' as any, showWidget: true, status: 'active' });
    setShowNewRegionForm(false);
    flash('Region added locally. Save All Changes to persist.');
  };

  const deleteRegionFromList = (id: string) => {
    if (!confirm('Are you sure you want to delete this region and all its candidates?')) return;
    setEditableRegions(prev => prev.filter(r => r._id !== id));
    if (selectedId === id) setSelectedId(editableRegions.find(r => r._id !== id)?._id ?? null);
    flash('Region deleted locally. Save All Changes to persist.');
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      for (const editableRegion of editableRegions) {
        const originalRegion = regions.find(r => r._id === editableRegion._id);

        if (!originalRegion) {
          // This is a new region
          await createRegion({
            name: editableRegion.name,
            nepaliName: editableRegion.nepaliName,
            totalCountPercent: editableRegion.totalCountPercent,
            showWidget: editableRegion.showWidget,
            status: editableRegion.status,
            candidates: editableRegion.candidates.map(({ _id, ...rest }) => rest) as any,
            isCurrentDisplay: editableRegion.isCurrentDisplay,
          });
        } else {
          // Existing region, check for updates
          const changes: Partial<IElectionRegion> = {};
          if (editableRegion.name !== originalRegion.name) changes.name = editableRegion.name;
          if (editableRegion.nepaliName !== originalRegion.nepaliName) changes.nepaliName = editableRegion.nepaliName;
          if (editableRegion.totalCountPercent !== originalRegion.totalCountPercent) changes.totalCountPercent = editableRegion.totalCountPercent;
          if (editableRegion.showWidget !== originalRegion.showWidget) changes.showWidget = editableRegion.showWidget;
          if (editableRegion.status !== originalRegion.status) changes.status = editableRegion.status;
          if (editableRegion.isCurrentDisplay !== originalRegion.isCurrentDisplay) changes.isCurrentDisplay = editableRegion.isCurrentDisplay;

          // Check for candidate changes
          const originalCandidateIds = new Set(originalRegion.candidates.map(c => c._id));
          const editableCandidateIds = new Set(editableRegion.candidates.map(c => c._id));

          let candidatesChanged = false;
          if (originalRegion.candidates.length !== editableRegion.candidates.length) {
            candidatesChanged = true;
          } else {
            for (const editableC of editableRegion.candidates) {
              const originalC = originalRegion.candidates.find(c => c._id === editableC._id);
              if (!originalC || JSON.stringify(editableC) !== JSON.stringify(originalC)) {
                candidatesChanged = true;
                break;
              }
            }
          }

          if (Object.keys(changes).length > 0 || candidatesChanged) {
            const candidatesToSave = editableRegion.candidates.map(c =>
              c._id?.startsWith('new-') ? (({ _id, ...rest }) => rest)(c) : c
            ) as any;
            await updateRegion(editableRegion._id, { ...changes, candidates: candidatesToSave });
          }
        }
      }

      // Handle deleted regions
      for (const originalRegion of regions) {
        if (!editableRegions.some(r => r._id === originalRegion._id)) {
          await deleteRegion(originalRegion._id);
        }
      }

      flash('All changes saved successfully! ✓');
      refreshRegions(); // Re-fetch all regions to sync state
    } catch (error) {
      console.error('Failed to save changes:', error);
      flash('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Regions list */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mukta-bold flex items-center gap-2">
            <Layers size={14} className="text-blue-400" /> Regions
          </h2>
          <button onClick={() => setShowNewRegionForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition mukta-bold">
            <Plus size={12} /> Add
          </button>
        </div>

        {showNewRegionForm && (
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white mukta-bold">New Region</h4>
              <button onClick={() => setShowNewRegionForm(false)} className="text-slate-500 hover:text-white transition"><X size={14} /></button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">English Name</label>
              <input value={newRegionForm.name} onChange={e => setNewRegionForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="Jhapa-5" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Nepali Name</label>
              <input value={newRegionForm.nepaliName} onChange={e => setNewRegionForm(p => ({ ...p, nepaliName: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="झापा-५" />
            </div>
            <button onClick={addRegion} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition mukta-bold">Add Region</button>
          </div>
        )}

        <div className="space-y-2">
          {editableRegions.map(r => (
            <div key={r._id}
              onClick={() => setSelectedId(r._id)}
              className={`p-3 rounded-xl border cursor-pointer transition group ${selectedId === r._id || (!selectedId && r._id === editableRegions[0]?._id)
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
                  <button onClick={e => { e.stopPropagation(); deleteRegionFromList(r._id); }}
                    className="p-1.5 bg-white/5 hover:bg-red-600/40 rounded-lg text-slate-400 hover:text-red-400 transition">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {editableRegions.length === 0 && (
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

        {/* Save All Changes button */}
        <button onClick={saveAllChanges} disabled={saving || !hasChanges}
          className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 mukta-bold">
          <Save size={14} /> {saving ? 'Saving…' : 'Save All Changes'}
        </button>

        {selected && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white mukta-bold flex items-center gap-2">
                <Monitor size={16} className="text-blue-400" />
                Edit Region: {selected.nepaliName}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">English Name</label>
                <input value={selected.name} onChange={e => handleRegionChange(selected._id, 'name', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="Jhapa-5" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Nepali Name</label>
                <input value={selected.nepaliName} onChange={e => handleRegionChange(selected._id, 'nepaliName', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="झापा-५" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Count / Status Text</label>
                <input type="text" value={selected.totalCountPercent ?? ''}
                  onChange={e => handleRegionChange(selected._id, 'totalCountPercent', e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition" placeholder="e.g. 45% or Counting" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Status</label>
                <select value={selected.status} onChange={e => handleRegionChange(selected._id, 'status', e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0a1120] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition">
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id={`onair-${selected._id}`} checked={selected.isCurrentDisplay}
                onChange={async e => {
                  handleRegionChange(selected._id, 'isCurrentDisplay', e.target.checked);
                  if (e.target.checked) { await setDisplayRegion(selected._id); flash('Set as On-Air ✓'); }
                }}
                className="w-4 h-4 accent-blue-500" />
              <label htmlFor={`onair-${selected._id}`} className="text-sm text-slate-300 mukta-semibold cursor-pointer">Set as ON AIR (public display)</label>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id={`showwidget-${selected._id}`} checked={selected.showWidget}
                onChange={e => handleRegionChange(selected._id, 'showWidget', e.target.checked)}
                className="w-4 h-4 accent-blue-500" />
              <label htmlFor={`showwidget-${selected._id}`} className="text-sm text-slate-300 mukta-semibold cursor-pointer">Show Election Widget on UI</label>
            </div>
          </div>
        )}

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
                <button onClick={() => setShowNewCandidateForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition mukta-bold">
                  <Plus size={12} /> Add Candidate
                </button>
              </div>
            </div>

            {showNewCandidateForm && (
              <div className="m-4 bg-black/30 border border-white/10 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white mukta-bold">New Candidate</h4>
                  <button onClick={() => { setShowNewCandidateForm(false); setNewCandidateForm(emptyC); }} className="text-slate-500 hover:text-white transition"><X size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Full Name (Nepali)</label>
                    <input value={newCandidateForm.name} onChange={e => setNewCandidateForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" placeholder="केपी शर्मा ओली" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party</label>
                    <input value={newCandidateForm.party} onChange={e => setNewCandidateForm(p => ({ ...p, party: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" placeholder="CPN-UML" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party Flag Image</label>
                    <ImageInput value={newCandidateForm.partySymbol} onChange={v => setNewCandidateForm(p => ({ ...p, partySymbol: v }))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Total Votes</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={toNepali(newCandidateForm.votes)}
                      onChange={e => setNewCandidateForm(p => ({ ...p, votes: parseNepaliInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold"
                      placeholder="०"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Vote Change</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={toNepali(newCandidateForm.changeVotes)}
                      onChange={e => setNewCandidateForm(p => ({ ...p, changeVotes: parseNepaliInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold"
                      placeholder="०"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Party Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={newCandidateForm.color} onChange={e => setNewCandidateForm(p => ({ ...p, color: e.target.value }))}
                        className="w-10 h-9 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                      <input value={newCandidateForm.color} onChange={e => setNewCandidateForm(p => ({ ...p, color: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Photo</label>
                    <ImageInput value={newCandidateForm.imageUrl} onChange={v => setNewCandidateForm(p => ({ ...p, imageUrl: v }))} />
                  </div>
                  <div className="col-span-2 flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={newCandidateForm.isElected || false} onChange={e => setNewCandidateForm(p => ({ ...p, isElected: e.target.checked }))} className="w-4 h-4 accent-purple-500" />
                    <label className="text-sm font-bold text-slate-300 mukta-bold cursor-pointer">Mark as Elected (Winner)</label>
                  </div>
                </div>
                <button onClick={() => addCandidateToRegion(selected._id)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 mukta-bold">
                  <Plus size={14} /> Add Candidate
                </button>
              </div>
            )}

            {/* Candidates list */}
            <div className="divide-y divide-white/5">
              {selected.candidates.length === 0 && (
                <div className="px-5 py-8 text-center text-slate-500 text-sm mukta-semibold">No candidates yet. Add one above.</div>
              )}
              {selected.candidates.map((c: ICandidate) => (
                <div key={c._id} className="p-4 space-y-3 hover:bg-white/[0.02] transition">
                  {/* Header row: color dot + preview images + delete */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: c.color }} />
                      {c.imageUrl && <img src={c.imageUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-white/10" />}
                      {c.partySymbol && <img src={c.partySymbol} alt="" className="w-7 h-7 rounded-full object-cover border border-white/10" />}
                    </div>
                    <button onClick={() => deleteCandidateFromRegion(selected._id, c._id)}
                      className="p-1.5 bg-white/5 hover:bg-red-600/40 rounded-lg text-slate-500 hover:text-red-400 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {/* Fields grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Full Name</label>
                      <input value={c.name} onChange={e => handleCandidateChange(selected._id, c._id, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Party</label>
                      <input value={c.party} onChange={e => handleCandidateChange(selected._id, c._id, 'party', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Color</label>
                      <div className="flex gap-1 items-center">
                        <input type="color" value={c.color} onChange={e => handleCandidateChange(selected._id, c._id, 'color', e.target.value)}
                          className="w-9 h-8 rounded border border-white/10 cursor-pointer bg-transparent flex-shrink-0" />
                        <input value={c.color} onChange={e => handleCandidateChange(selected._id, c._id, 'color', e.target.value)}
                          className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Total Votes</label>
                      <input type="text" inputMode="numeric" value={toNepali(c.votes)}
                        onChange={e => handleCandidateChange(selected._id, c._id, 'votes', parseNepaliInt(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Vote Change</label>
                      <input type="text" inputMode="numeric" value={toNepali(c.changeVotes)}
                        onChange={e => handleCandidateChange(selected._id, c._id, 'changeVotes', parseNepaliInt(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition mukta-bold" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Party Flag / Logo</label>
                      <ImageInput value={c.partySymbol || ''} onChange={v => handleCandidateChange(selected._id, c._id, 'partySymbol', v)} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 mukta-bold uppercase">Candidate Photo</label>
                      <ImageInput value={c.imageUrl || ''} onChange={v => handleCandidateChange(selected._id, c._id, 'imageUrl', v)} />
                    </div>
                    <div className="col-span-2 flex items-center gap-2 mt-1">
                      <input type="checkbox" id={`right-elected-${c._id}`} checked={c.isElected || false} onChange={e => handleCandidateChange(selected._id, c._id, 'isElected', e.target.checked)} className="w-4 h-4 accent-purple-500" />
                      <label htmlFor={`right-elected-${c._id}`} className="text-xs font-bold text-amber-400 mukta-bold cursor-pointer">🏆 Mark as Elected (Winner)</label>
                    </div>
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
              <input
                type="text"
                inputMode="numeric"
                value={toNepali(form.votes)}
                onChange={e => setForm(p => ({ ...p, votes: parseNepaliInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition mukta-bold"
                placeholder="०"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Vote Change</label>
              <input
                type="text"
                inputMode="numeric"
                value={toNepali(form.changeVotes)}
                onChange={e => setForm(p => ({ ...p, changeVotes: parseNepaliInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition mukta-bold"
                placeholder="०"
              />
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

// ─── Marquee Tab ────────────────────────────────────────────────────────────
function MarqueeTab() {
  const { heading, items, createItem, updateItem, deleteItem, updateHeading } = useNewsMarquee();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [tempHeading, setTempHeading] = useState(heading);
  const [savingHeading, setSavingHeading] = useState(false);

  const [msg, setMsg] = useState('');
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const [text, setText] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setTempHeading(heading);
  }, [heading]);

  const saveHeading = async () => {
    if (!tempHeading.trim()) return;
    try {
      setSavingHeading(true);
      await updateHeading(tempHeading);
      flash('Heading Updated ✓');
    } finally {
      setSavingHeading(false);
    }
  };

  const openEdit = (item: INewsMarqueeItem) => {
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

  const moveOrder = async (item: INewsMarqueeItem, dir: -1 | 1) => {
    const newOrder = item.order + dir;
    const swap = items.find(i => i.order === newOrder);
    if (swap) await updateItem(swap._id, { order: item.order });
    await updateItem(item._id, { order: newOrder });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mukta-bold flex items-center gap-2">
          <MessageSquare size={14} className="text-orange-400" />
          General Marquee (White Bar)
          <span className="ml-1 text-[11px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">{items.length} total · {items.filter(i => i.isActive).length} active</span>
        </h2>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={tempHeading}
            onChange={e => setTempHeading(e.target.value)}
            placeholder="Marquee Heading"
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition max-w-[150px]"
          />
          <button onClick={saveHeading} disabled={savingHeading || tempHeading === heading}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition mukta-bold shrink-0">
            <Save size={12} /> Save Heading
          </button>
          <button onClick={openAdd}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition mukta-bold shrink-0">
            <Plus size={12} /> Add News
          </button>
        </div>
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
              <MessageSquare size={15} className="text-orange-400" />
              {editingId ? 'Edit Marquee News' : 'New Marquee News'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-500 hover:text-white transition"><X size={16} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 mukta-bold">Text</label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
                placeholder="Type marquee news here..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="mactive" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded" />
              <label htmlFor="mactive" className="text-sm text-slate-300 mukta-semibold cursor-pointer">Show in ticker</label>
            </div>
          </div>
          <button onClick={save} disabled={saving}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 mukta-bold">
            <Save size={14} /> {saving ? 'Saving…' : 'Save News'}
          </button>
        </div>
      )}

      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm mukta-semibold">No marquee items yet.</div>
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

                <div className="w-1.5 h-10 rounded-full flex-shrink-0 bg-orange-500" />

                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-white text-sm mukta-semibold leading-snug">{item.text}</p>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => updateItem(item._id, { isActive: !item.isActive })}
                    className={`p-1.5 rounded-lg transition ${item.isActive ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                    {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="p-1.5 bg-white/5 hover:bg-orange-600/40 rounded-lg text-slate-400 hover:text-white transition opacity-0 group-hover:opacity-100">
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
  const { items: marqueeItems, refreshNews: refreshMarquee } = useNewsMarquee();
  const { connected, socketUnavailable } = useSocket();
  const isLive = connected || socketUnavailable;
  const [tab, setTab] = useState<'widget' | 'leftwidget' | 'ticker' | 'news' | 'marquee'>('widget');
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
    await refreshMarquee();
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
            { label: 'Marquee News', value: marqueeItems.length, color: 'text-orange-400' },
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
          <div className="flex gap-1 py-2 overflow-x-auto no-scrollbar">
            {([
              { id: 'widget', label: 'Right Election Widget', icon: <Monitor size={14} />, color: 'blue' },
              { id: 'leftwidget', label: 'Left Election Widget', icon: <Monitor size={14} />, color: 'blue' },
              { id: 'ticker', label: 'Ticker Bar', icon: <Radio size={14} />, color: 'cyan' },
              { id: 'marquee', label: 'White Marquee', icon: <MessageSquare size={14} />, color: 'orange' },
              { id: 'news', label: 'Breaking News', icon: <MessageSquare size={14} />, color: 'red' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition mukta-bold ${tab === t.id
                  ? t.color === 'blue' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : t.color === 'cyan' ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                      : t.color === 'orange' ? 'bg-orange-600/30 text-orange-300 border border-orange-500/40'
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
        {tab === 'widget' ? <WidgetTab /> : tab === 'leftwidget' ? <LeftWidgetTab /> : tab === 'ticker' ? <TickerTab /> : tab === 'marquee' ? <MarqueeTab /> : <NewsTab />}
      </main>
    </div>
  );
}
