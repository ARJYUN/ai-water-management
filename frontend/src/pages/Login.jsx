import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Droplets, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email) => setForm({ email, password: 'password123' });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #0d1f4a 0%, #0a0f1e 40%, #06111a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', top: '-200px', left: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', bottom: '-100px', right: '100px', pointerEvents: 'none' }} />

      <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', borderRadius: '20px', padding: '16px', marginBottom: '16px' }}>
            <Droplets size={32} color="white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>WaterAI</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>AI Resource Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <input className="input-dark" type="email" placeholder="admin@water.ai" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input-dark" type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick login cards */}
        <div style={{ marginTop: '28px', borderTop: '1px solid rgba(30,58,95,0.4)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.72rem', color: '#475569', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Login (Demo)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Admin', email: 'admin@water.ai', color: '#ef4444' },
              { label: 'DevOps', email: 'devops@water.ai', color: '#3b82f6' },
              { label: 'Sustainability', email: 'sustain@water.ai', color: '#10b981' },
              { label: 'Viewer', email: 'viewer@water.ai', color: '#94a3b8' },
            ].map(({ label, email, color }) => (
              <button key={label} onClick={() => quickLogin(email)} style={{
                background: `${color}15`, border: `1px solid ${color}30`, borderRadius: '8px',
                padding: '8px', color, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.background = `${color}25`}
                onMouseLeave={e => e.currentTarget.style.background = `${color}15`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
