import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Cpu, BarChart2, TrendingUp, Zap,
  Shield, FileText, Users, LogOut, Droplets, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard, roles: ['Admin','DevOps Engineer','Sustainability Officer','Viewer'] },
  { to: '/workloads',  label: 'Workloads',  icon: Cpu,              roles: ['Admin','DevOps Engineer'] },
  { to: '/metrics',    label: 'Metrics',    icon: BarChart2,         roles: ['Admin','DevOps Engineer','Sustainability Officer'] },
  { to: '/analytics',  label: 'Analytics',  icon: TrendingUp,        roles: ['Admin','DevOps Engineer','Sustainability Officer','Viewer'] },
  { to: '/optimize',   label: 'Optimize',   icon: Zap,              roles: ['Admin','DevOps Engineer'] },
  { to: '/policies',   label: 'Policies',   icon: Shield,           roles: ['Admin','Sustainability Officer'] },
  { to: '/reports',    label: 'Reports',    icon: FileText,          roles: ['Admin','DevOps Engineer','Sustainability Officer'] },
  { to: '/admin',      label: 'Admin',      icon: Users,            roles: ['Admin'] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColors = {
    'Admin': 'badge-red',
    'DevOps Engineer': 'badge-blue',
    'Sustainability Officer': 'badge-green',
    'Viewer': 'badge-gray'
  };

  const allowed = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside style={{
      width: collapsed ? '72px' : '240px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d1530 0%, #0a0f1e 100%)',
      borderRight: '1px solid rgba(30,58,95,0.5)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
      overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(30,58,95,0.4)', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '72px' }}>
        <div style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', borderRadius: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Droplets size={20} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f1f5f9', letterSpacing: '-0.01em' }}>WaterAI</div>
            <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 500 }}>Resource Manager</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px', flexShrink: 0 }}>
          {collapsed ? <ChevronRight size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {allowed.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', borderRadius: '10px',
            marginBottom: '4px', textDecoration: 'none',
            fontSize: '0.85rem', fontWeight: 500,
            transition: 'all 0.2s ease',
            color: isActive ? '#f1f5f9' : '#64748b',
            background: isActive ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))' : 'transparent',
            borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
          })}>
            <item.icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(30,58,95,0.4)' }}>
        {!collapsed && (
          <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(13,21,48,0.6)', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <span className={`badge ${roleColors[user?.role] || 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>{user?.role}</span>
          </div>
        )}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', padding: '10px 12px', borderRadius: '10px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#ef4444', fontSize: '0.85rem', fontWeight: 500,
          transition: 'all 0.2s ease'
        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
           onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
