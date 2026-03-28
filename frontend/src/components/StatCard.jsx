import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#3b82f6', trend }) {
  return (
    <div className="glass-card glass-card-hover stat-card fade-in-up" style={{ '--glow-color': color, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{title}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, marginBottom: '6px' }}>{value}</div>
          {subtitle && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{subtitle}</div>}
          {trend !== undefined && (
            <div style={{ fontSize: '0.75rem', marginTop: '8px', color: trend >= 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
              <span style={{ color: '#475569' }}>vs last week</span>
            </div>
          )}
        </div>
        <div style={{ background: `${color}22`, borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={26} color={color} />
        </div>
      </div>
    </div>
  );
}
