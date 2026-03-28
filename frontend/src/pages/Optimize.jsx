import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const WUE_COLORS = { 'us-central': '#3b82f6', 'asia-east': '#f59e0b', 'europe-west': '#10b981' };

export default function Optimize() {
  const [wueData, setWueData] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [selectedWL, setSelectedWL] = useState('');
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/optimize'), api.get('/workloads')])
      .then(([o, w]) => {
        setWueData(o.data);
        setWorkloads(w.data.filter(wl => !['Completed','Aborted'].includes(wl.status)));
      })
      .catch(() => toast.error('Failed to load optimize data'))
      .finally(() => setLoading(false));
  }, []);

  const handleSchedule = async () => {
    if (!selectedWL) return toast.error('Select a workload first');
    setReassigning(true);
    try {
      const { data } = await api.post('/optimize/schedule', { workloadID: selectedWL });
      toast.success(data.message);
      setLastResult(data);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setReassigning(false); }
  };

  const chartData = wueData.map(r => ({
    region: r.label || r.region,
    WUE: r.wue,
    'Avg Water (L)': parseFloat(r.avg_liters || 0).toFixed(1) * 1,
    workloads: r.workload_count
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 16px' }}>
        <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '6px' }}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.color, fontSize: '0.8rem' }}>{p.name}: {p.value}</p>)}
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading optimizer…</div>;

  return (
    <div>
      <h1 className="page-title gradient-text">Workload Optimizer</h1>
      <p className="page-subtitle">Compare regional WUE and reassign workloads to minimize water usage</p>

      {/* WUE comparison cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {wueData.map(r => (
          <div key={r.region} className="glass-card glass-card-hover stat-card" style={{ '--glow-color': WUE_COLORS[r.region], padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{r.label || r.region}</h3>
              {r.wue === 0.9 && <span className="badge badge-green">⚡ Optimal</span>}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: WUE_COLORS[r.region], marginBottom: '4px' }}>{r.wue}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '12px' }}>L/kWh Water Usage Effectiveness</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Avg: <strong style={{ color: '#f1f5f9' }}>{parseFloat(r.avg_liters || 0).toFixed(0)} L</strong> / workload</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Workloads: <strong style={{ color: '#f1f5f9' }}>{r.workload_count}</strong></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '20px' }}>
        {/* Bar chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>WUE & Avg Usage Comparison</h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>Lower WUE = more water-efficient region</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" />
              <XAxis dataKey="region" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="WUE" name="WUE (L/kWh)" radius={[4,4,0,0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={Object.values(WUE_COLORS)[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reassign panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Zap size={20} color="#f59e0b" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Reassign Workload</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
            Select an active workload to reassign it to <strong style={{ color: '#10b981' }}>europe-west</strong> (lowest WUE: 0.9 L/kWh).
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Select Workload</label>
            <select className="input-dark" value={selectedWL} onChange={e => setSelectedWL(e.target.value)}>
              <option value="">Choose workload…</option>
              {workloads.map(w => (
                <option key={w.workloadID} value={w.workloadID}>
                  {w.workloadID.slice(0,8)}… — {w.type} ({w.region})
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSchedule} disabled={reassigning || !selectedWL}>
            <Zap size={16} />
            {reassigning ? 'Reassigning…' : 'Reassign to Optimal Region'}
          </button>
          {lastResult && (
            <div style={{ marginTop: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Reassigned!</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{lastResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
