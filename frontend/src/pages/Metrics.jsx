import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const REGIONS = ['', 'us-central', 'asia-east', 'europe-west'];

export default function Metrics() {
  const [metrics, setMetrics] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filters, setFilters] = useState({ region: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.region) params.append('region', filters.region);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const { data } = await api.get(`/metrics?${params}`);
      setMetrics(data);

      // Build chart: by region
      const byRegion = {};
      data.forEach(m => {
        if (!byRegion[m.region]) byRegion[m.region] = { region: m.region, total: 0, count: 0 };
        byRegion[m.region].total += m.freshwater_liters;
        byRegion[m.region].count++;
      });
      setChartData(Object.values(byRegion).map(r => ({ ...r, total: parseFloat(r.total.toFixed(1)), avg: parseFloat((r.total / r.count).toFixed(1)) })));
    } catch { toast.error('Failed to load metrics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 16px' }}>
        <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '6px' }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color, fontSize: '0.8rem' }}>{p.name}: {p.value?.toLocaleString()} L</p>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title gradient-text">Water Metrics</h1>
          <p className="page-subtitle">Raw water usage data across all workloads and regions</p>
        </div>
        <button className="btn-ghost" onClick={load}><RefreshCw size={16} />Refresh</button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Filter size={16} color="#64748b" style={{ alignSelf: 'center' }} />
        <div>
          <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Region</label>
          <select className="input-dark" style={{ width: '160px' }} value={filters.region} onChange={e => setFilters({...filters, region: e.target.value})}>
            <option value="">All Regions</option>
            {REGIONS.slice(1).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>From</label>
          <input type="date" className="input-dark" style={{ width: '160px' }} value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>To</label>
          <input type="date" className="input-dark" style={{ width: '160px' }} value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
        </div>
        <button className="btn-primary" onClick={load}>Apply</button>
      </div>

      {/* Bar Chart */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>Water Usage by Region</h2>
        <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>Total & average freshwater consumption (liters)</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" />
            <XAxis dataKey="region" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="total" name="Total (L)" fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="avg" name="Avg per Workload (L)" fill="#06b6d4" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(30,58,95,0.4)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>Raw Readings</h3>
          <span style={{ fontSize: '0.8rem', color: '#475569' }}>{metrics.length} records</span>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Metric ID</th><th>Workload</th><th>Liters</th><th>Region</th><th>Source</th><th>Type</th><th>Recorded</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#475569' }}>Loading...</td></tr>
                : metrics.map(m => (
                <tr key={m.metricID}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#475569' }}>{m.metricID?.slice(0,8)}…</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#475569' }}>{m.workloadID?.slice(0,8)}…</td>
                  <td style={{ fontWeight: 600, color: m.freshwater_liters > 400 ? '#f59e0b' : '#10b981' }}>{m.freshwater_liters?.toFixed(1)} L</td>
                  <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{m.region}</td>
                  <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.source}</td>
                  <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{m.workload_type || '—'}</td>
                  <td style={{ fontSize: '0.75rem' }}>{new Date(m.recorded_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
