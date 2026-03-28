import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Shield, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const REGIONS = ['us-central','asia-east','europe-west'];
const WUE = { 'us-central': 1.1, 'asia-east': 1.3, 'europe-west': 0.9 };

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ region: 'us-central', threshold_liters: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/policies');
      setPolicies(data);
    } catch { toast.error('Failed to load policies'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async e => {
    e.preventDefault();
    if (!form.threshold_liters) return toast.error('Set a threshold');
    setSaving(true);
    try {
      await api.post('/policies', { region: form.region, threshold_liters: parseFloat(form.threshold_liters) });
      toast.success(`Policy saved for ${form.region}`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="page-title gradient-text">Water Policies</h1>
      <p className="page-subtitle">Set freshwater consumption thresholds per region — triggers automatic alerts</p>

      {/* Info banner */}
      <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Shield size={18} color="#06b6d4" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          When a workload transitions to <strong style={{ color: '#f1f5f9' }}>Executing</strong> status, the system checks if estimated water usage exceeds the region threshold. If exceeded, the workload is automatically <strong style={{ color: '#8b5cf6' }}>PausedForOptimization</strong> and an alert is generated.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Current policies */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Active Policies</h2>
          </div>
          {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>Loading…</div>
            : policies.length === 0
              ? <div style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>No policies configured</div>
              : (
            <div style={{ padding: '16px' }}>
              {policies.map(p => (
                <div key={p.policyID} className="glass-card" style={{ padding: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>{p.region}</span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>WUE {WUE[p.region] || '—'} L/kWh</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Set {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{p.threshold_liters?.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>liters / workload</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Set policy form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Plus size={18} color="#3b82f6" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Set / Update Policy</h2>
          </div>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Region</label>
              <select className="input-dark" value={form.region} onChange={e => setForm({...form, region: e.target.value})}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Threshold (Liters)</label>
              <input type="number" className="input-dark" placeholder="e.g. 5000" value={form.threshold_liters}
                onChange={e => setForm({...form, threshold_liters: e.target.value})} min={1} />
              <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: '6px' }}>
                Expected training usage: ~{(400 * (WUE[form.region] || 1.1)).toFixed(0)} L | Inference: ~{(100 * (WUE[form.region] || 1.1)).toFixed(0)} L
              </p>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Policy'}
            </button>
          </form>

          {/* Quick presets */}
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(30,58,95,0.4)', paddingTop: '16px' }}>
            <p style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Presets</p>
            {[{ label: 'Conservative (3000 L)', val: 3000 }, { label: 'Standard (5000 L)', val: 5000 }, { label: 'Flexible (8000 L)', val: 8000 }].map(p => (
              <button key={p.val} onClick={() => setForm(f => ({...f, threshold_liters: p.val}))} className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '6px', padding: '8px 12px', fontSize: '0.8rem' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
