import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { FileText, Download, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports');
      setReports(data);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/reports/generate');
      toast.success('Report generated!');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to generate'); }
    finally { setGenerating(false); }
  };

  const parseContent = (raw) => {
    try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title gradient-text">Reports</h1>
          <p className="page-subtitle">System-wide water usage snapshots and analytics reports</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-ghost" onClick={load}><RefreshCw size={16} />Refresh</button>
          <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
            <Sparkles size={16} />
            {generating ? 'Generating…' : 'Generate Report'}
          </button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Loading reports…</div>
        : reports.length === 0
          ? <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>No reports yet — click "Generate Report" to create one.</div>
          : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reports.map(r => {
            const content = parseContent(r.content);
            return (
              <div key={r.reportID} className="glass-card glass-card-hover" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(59,130,246,0.15)', borderRadius: '10px', padding: '10px' }}>
                      <FileText size={18} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>ID: {r.reportID?.slice(0,16)}…</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        By <strong style={{ color: '#f1f5f9' }}>{r.generated_by_name || 'System'}</strong>
                        <span className={`badge badge-${r.generated_by_role === 'Admin' ? 'red' : 'blue'}`} style={{ marginLeft: '8px', fontSize: '0.65rem' }}>{r.generated_by_role}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#475569' }}>
                    {new Date(r.generated_at).toLocaleString()}
                  </div>
                </div>

                {content && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Total Water</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#06b6d4' }}>{parseFloat(content.total_water_liters || 0).toFixed(0)} L</div>
                    </div>
                    <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Workloads</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3b82f6' }}>{content.total_workloads || 0}</div>
                    </div>
                    <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Alerts</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{content.total_alerts || 0}</div>
                    </div>
                    {content.by_region?.map(reg => (
                      <div key={reg.region} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{reg.region}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{parseFloat(reg.total).toFixed(0)} L</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
