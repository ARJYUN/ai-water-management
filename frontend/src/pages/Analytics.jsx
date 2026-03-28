import React, { useEffect, useState } from 'react';
import api from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const TYPE_COLORS = { training: '#8b5cf6', inference: '#06b6d4', scaling: '#f59e0b' };
const REGION_COLORS = { 'us-central': '#3b82f6', 'asia-east': '#f59e0b', 'europe-west': '#10b981' };

export default function Analytics() {
  const [correlate, setCorrelate] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/correlate'), api.get('/analytics/trends')])
      .then(([c, t]) => {
        setCorrelate(c.data);
        // Aggregate trends by date across all regions
        const byDate = {};
        t.data.forEach(r => {
          const d = r.date?.split('T')[0] || r.date;
          if (!byDate[d]) byDate[d] = { date: d, total: 0 };
          byDate[d].total += parseFloat(r.total_liters || 0);
          byDate[d][r.region] = parseFloat(r.total_liters || 0);
        });
        setTrends(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)));
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  // Pivot correlate data: group by workload_type
  const byTypeSummary = {};
  correlate.forEach(r => {
    if (!byTypeSummary[r.workload_type]) byTypeSummary[r.workload_type] = { type: r.workload_type, total: 0, avg: 0, count: 0 };
    byTypeSummary[r.workload_type].total += parseFloat(r.total_liters);
    byTypeSummary[r.workload_type].avg += parseFloat(r.avg_liters);
    byTypeSummary[r.workload_type].count++;
  });
  const typeData = Object.values(byTypeSummary).map(t => ({
    ...t,
    total: parseFloat(t.total.toFixed(0)),
    avg: parseFloat((t.avg / (t.count || 1)).toFixed(1))
  }));

  // Per-region-per-type data
  const regionTypeData = correlate.map(r => ({
    name: `${r.workload_type} / ${r.region?.split('-')[0]}`,
    avg_liters: parseFloat(r.avg_liters || 0).toFixed(1) * 1,
    total_liters: parseFloat(r.total_liters || 0).toFixed(0) * 1,
    type: r.workload_type,
    region: r.region
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 16px' }}>
        <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '6px', fontSize: '0.8rem' }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color || '#94a3b8', fontSize: '0.78rem' }}>{p.name}: {p.value?.toLocaleString()} L</p>
        ))}
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading analytics…</div>;

  return (
    <div>
      <h1 className="page-title gradient-text">Analytics</h1>
      <p className="page-subtitle">Correlations between workload type, region, and water consumption</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Water by workload type */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>Usage by Workload Type</h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>Total freshwater usage per AI workload category</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" />
              <XAxis dataKey="type" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="total" name="Total (L)" radius={[4,4,0,0]}>
                {typeData.map(entry => (
                  <Cell key={entry.type} fill={TYPE_COLORS[entry.type] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg water per type */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>Avg per Workload Type</h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>Average liters per workload execution across all regions</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" />
              <XAxis dataKey="type" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" name="Avg (L)" radius={[4,4,0,0]}>
                {typeData.map(entry => (
                  <Cell key={entry.type} fill={TYPE_COLORS[entry.type] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-day trend */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>30-Day Trend by Region</h2>
        <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>Daily freshwater consumption across all three regions</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {Object.keys(REGION_COLORS).map(r => (
              <Line key={r} type="monotone" dataKey={r} stroke={REGION_COLORS[r]} strokeWidth={2} dot={false} name={r} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Correlation table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>Type × Region Correlation</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Workload Type</th><th>Region</th><th>Avg Liters</th><th>Total Liters</th><th>Count</th></tr>
            </thead>
            <tbody>
              {correlate.map((r, i) => (
                <tr key={i}>
                  <td><span className={`badge badge-${r.workload_type === 'training' ? 'purple' : r.workload_type === 'inference' ? 'cyan' : 'amber'}`}>{r.workload_type}</span></td>
                  <td style={{ color: '#94a3b8' }}>{r.region}</td>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{parseFloat(r.avg_liters).toFixed(1)} L</td>
                  <td style={{ color: '#06b6d4' }}>{parseFloat(r.total_liters).toFixed(0)} L</td>
                  <td style={{ color: '#64748b' }}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
