import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/alerts');
      setAlerts(data);
    } catch { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title gradient-text">Alerts</h1>
          <p className="page-subtitle">Policy threshold breach notifications</p>
        </div>
        <button className="btn-ghost" onClick={load}><RefreshCw size={16} />Refresh</button>
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(30,58,95,0.4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>All Alerts</span>
          <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>{alerts.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Alert ID</th><th>Message</th><th>Workload Type</th><th>Region</th><th>Triggered</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>Loading…</td></tr>
                : alerts.map(a => (
                <tr key={a.alertID}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#475569' }}>{a.alertID?.slice(0,8)}…</td>
                  <td style={{ maxWidth: '400px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>{a.message}</td>
                  <td>{a.workload_type ? <span className={`badge badge-${a.workload_type === 'training' ? 'purple' : a.workload_type === 'inference' ? 'cyan' : 'amber'}`}>{a.workload_type}</span> : '—'}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{a.region || '—'}</td>
                  <td style={{ fontSize: '0.78rem' }}>{new Date(a.triggered_at).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && alerts.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>✅ No alerts — all systems within policy limits</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
