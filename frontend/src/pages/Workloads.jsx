import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { StatusBadge, TypeBadge, RegionBadge } from '../components/Badges';
import { Plus, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Submitted','Queued','Executing','Completed','Failed','Aborted','PausedForOptimization','Deferred'];
const REGIONS = ['us-central','asia-east','europe-west'];
const TYPES = ['training','inference','scaling'];

export default function Workloads() {
  const { user } = useAuth();
  const [workloads, setWorkloads] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'training', region: 'us-central' });
  const [submitting, setSubmitting] = useState(false);

  const canEdit = ['Admin','DevOps Engineer'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workloads');
      setWorkloads(data);
    } catch { toast.error('Failed to load workloads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/workloads', form);
      toast.success('Workload submitted!');
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/workloads/${id}/status`, { status });
      toast.success(`Status → ${data.status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
  };

  const filtered = workloads.filter(w =>
    w.workloadID.toLowerCase().includes(search.toLowerCase()) ||
    w.type.includes(search.toLowerCase()) ||
    w.region.includes(search.toLowerCase()) ||
    w.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title gradient-text">Workloads</h1>
          <p className="page-subtitle">Manage and monitor AI workload execution</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-ghost" onClick={load}><RefreshCw size={16} />Refresh</button>
          {canEdit && <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} />Submit Workload</button>}
        </div>
      </div>

      {/* Submit form */}
      {showForm && canEdit && (
        <div className="glass-card fade-in-up" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>New Workload</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Type</label>
              <select className="input-dark" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Region</label>
              <select className="input-dark" value={form.region} onChange={e => setForm({...form, region: e.target.value})}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(30,58,95,0.4)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input className="input-dark" placeholder="Search by ID, type, region, status…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#475569' }}>{filtered.length} workloads</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Type</th><th>Status</th><th>Region</th><th>Retries</th><th>Submitted</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>Loading...</td></tr>
              ) : filtered.map(w => (
                <tr key={w.workloadID}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748b' }}>{w.workloadID.slice(0, 8)}…</td>
                  <td><TypeBadge type={w.type} /></td>
                  <td><StatusBadge status={w.status} /></td>
                  <td><RegionBadge region={w.region} /></td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: w.retry_count >= 3 ? '#ef4444' : '#94a3b8' }}>{w.retry_count}</span>
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>{new Date(w.submitted_at).toLocaleDateString()}</td>
                  {canEdit && (
                    <td>
                      <select onChange={e => e.target.value && updateStatus(w.workloadID, e.target.value)}
                        style={{ background: 'rgba(13,21,48,0.8)', border: '1px solid #1e3a5f', borderRadius: '6px', color: '#94a3b8', fontSize: '0.75rem', padding: '4px 8px', cursor: 'pointer' }}
                        value="">
                        <option value="">Set status…</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>No workloads found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
