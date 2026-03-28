import React, { useEffect, useState } from 'react';
import api from '../api/client';
import StatCard from '../components/StatCard';
import { Droplets, Cpu, AlertTriangle, Activity, BellRing } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const REGIONS = ['us-central', 'asia-east', 'europe-west'];
const REGION_COLORS = { 'us-central': '#3b82f6', 'asia-east': '#f59e0b', 'europe-west': '#10b981' };

function buildChartData(raw) {
  const byDate = {};
  raw.forEach(r => {
    const d = r.date?.split('T')[0] || r.date;
    if (!byDate[d]) byDate[d] = { date: d };
    byDate[d][r.region] = parseFloat(r.total_liters || 0).toFixed(0) * 1;
  });
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/trends'),
      api.get('/alerts'),
    ]).then(([s, t, a]) => {
      setSummary(s.data);
      setTrends(buildChartData(t.data));
      setAlerts(a.data.slice(0, 6));
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 16px' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '8px' }}>{label}</p>
        {payload.map(p => (
          <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{p.dataKey}:</span>
            <span style={{ color: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600 }}>{p.value?.toLocaleString()} L</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Droplets size={40} color="#3b82f6" style={{ margin: '0 auto 12px', display: 'block' }} />
        <p style={{ color: '#64748b' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title gradient-text">Dashboard</h1>
        <p className="page-subtitle">Real-time water usage monitoring across all AI data centers</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        <StatCard title="Total Water Used" value={`${(summary?.total_water_liters / 1000)?.toFixed(1)}K L`} subtitle="All regions, all time" icon={Droplets} color="#06b6d4" trend={4.2} />
        <StatCard title="Total Workloads" value={summary?.total_workloads?.toLocaleString()} subtitle="Across all regions" icon={Cpu} color="#3b82f6" />
        <StatCard title="Active Workloads" value={summary?.active_workloads} subtitle="Queued + Executing" icon={Activity} color="#10b981" />
        <StatCard title="Total Alerts" value={summary?.total_alerts} subtitle="Policy threshold breaches" icon={AlertTriangle} color="#f59e0b" />
      </div>

      {/* Charts + Alerts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', marginBottom: '28px' }}>
        {/* Trend Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>30-Day Water Consumption</h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Daily totals by region (liters)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {REGIONS.map(r => (
                <Line key={r} type="monotone" dataKey={r} stroke={REGION_COLORS[r]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <BellRing size={18} color="#f59e0b" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Recent Alerts</h2>
            <span className="badge badge-amber" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>{alerts.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No alerts</p>
            ) : alerts.map(alert => (
              <div key={alert.alertID} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '12px' }}>
                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>{alert.message}</p>
                <p style={{ fontSize: '0.68rem', color: '#475569', marginTop: '6px' }}>{new Date(alert.triggered_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
