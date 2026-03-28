import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Users, Edit2, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['Admin','DevOps Engineer','Sustainability Officer','Viewer'];
const roleColors = { 'Admin': 'badge-red', 'DevOps Engineer': 'badge-blue', 'Sustainability Officer': 'badge-green', 'Viewer': 'badge-gray' };

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch { toast.error('Access denied or failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role: editRole });
      toast.success('Role updated!');
      setEditingId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user ${name}?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success(`User ${name} deleted.`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Delete failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title gradient-text">Admin Panel</h1>
          <p className="page-subtitle">Manage users and role assignments</p>
        </div>
        <button className="btn-ghost" onClick={load}><RefreshCw size={16} />Refresh</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>{count}</div>
              <span className={`badge ${roleColors[role]}`} style={{ fontSize: '0.68rem' }}>{role}</span>
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(30,58,95,0.4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={18} color="#3b82f6" />
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>All Users</h2>
          <span style={{ color: '#475569', fontSize: '0.8rem', marginLeft: 'auto' }}>{users.length} users</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>Loading…</td></tr>
                : users.map(u => (
                <tr key={u.userID}>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{u.name}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</td>
                  <td>
                    {editingId === u.userID ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <select className="input-dark" style={{ padding: '4px 8px', fontSize: '0.78rem', width: '180px' }} value={editRole} onChange={e => setEditRole(e.target.value)}>
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={() => handleRoleChange(u.userID)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Save</button>
                        <button onClick={() => setEditingId(null)} className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Cancel</button>
                      </div>
                    ) : <span className={`badge ${roleColors[u.role] || 'badge-gray'}`}>{u.role}</span>}
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setEditingId(u.userID); setEditRole(u.role); }} className="btn-ghost" style={{ padding: '5px 10px', fontSize: '0.75rem', gap: '4px' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => handleDelete(u.userID, u.name)} className="btn-danger" style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
