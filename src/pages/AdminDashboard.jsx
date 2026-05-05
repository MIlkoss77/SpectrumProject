import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Users, CreditCard, TrendingUp, Shield, Search, Zap, RefreshCw, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './dashboard.css';

const token = () => localStorage.getItem('spectr_auth_token');
const api = (url, opts = {}) => axios.get(url, { headers: { Authorization: `Bearer ${token()}` }, ...opts });
const apiPatch = (url, data) => axios.patch(url, data, { headers: { Authorization: `Bearer ${token()}` } });

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="dx-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ padding: 10, borderRadius: 14, background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={20} color={color} />
        </div>
        {sub && <span style={{ fontSize: 11, color: 'var(--ok)', fontWeight: 700, background: 'rgba(0,227,150,0.08)', padding: '3px 8px', borderRadius: 8 }}>{sub}</span>}
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: -1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    PRO:       { bg: 'rgba(255,214,0,0.1)',   color: '#FFD600', border: 'rgba(255,214,0,0.2)' },
    FREE:      { bg: 'rgba(255,255,255,0.04)', color: 'var(--muted)', border: 'rgba(255,255,255,0.08)' },
    COMPLETED: { bg: 'rgba(0,227,150,0.1)',   color: 'var(--ok)',  border: 'rgba(0,227,150,0.2)' },
    PENDING:   { bg: 'rgba(254,176,25,0.1)',  color: 'var(--warn)', border: 'rgba(254,176,25,0.2)' },
    FAILED:    { bg: 'rgba(255,69,96,0.1)',   color: 'var(--bad)',  border: 'rgba(255,69,96,0.2)' },
  };
  const s = map[status] || map.FREE;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

// ── Users Tab ──────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, search: debouncedSearch, status: statusFilter });
      const res = await api(`/api/admin/users?${params}`);
      if (res.data.ok) { setUsers(res.data.users); setTotal(res.data.pagination.total); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleSub = async (userId, currentStatus) => {
    const next = currentStatus === 'PRO' ? 'FREE' : 'PRO';
    if (!confirm(`Change subscription to ${next}?`)) return;
    setActionLoading(userId);
    try {
      await apiPatch(`/api/admin/users/${userId}/subscription`, { status: next });
      setUsers(u => u.map(x => x.id === userId ? { ...x, subscriptionStatus: next } : x));
    } catch (e) { alert('Failed'); }
    finally { setActionLoading(null); }
  };

  const pages = Math.ceil(total / 20);

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search email, name, telegram…" style={{ width: '100%', paddingLeft: 36, height: 40, fontSize: 13 }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ height: 40, fontSize: 13, minWidth: 120 }}>
          <option value="">All Status</option>
          <option value="PRO">PRO</option>
          <option value="FREE">FREE</option>
        </select>
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 12, color: 'var(--muted)' }}>{total} users</span>
      </div>

      {/* Table */}
      <div className="dx-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                {['User', 'Status', 'Telegram', 'Payments', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.05)', width: j === 0 ? 140 : 60, animation: 'pulse 1.5s infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,rgba(0,255,255,0.15),rgba(79,70,229,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--accent)', fontSize: 13 }}>
                        {(u.displayName?.[0] || u.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{u.displayName || 'Unnamed'}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}><Badge status={u.subscriptionStatus} /></td>
                  <td style={{ padding: '14px 16px' }}>
                    {u.telegramId
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ok)', fontSize: 12 }}><CheckCircle size={12} />{u.telegramId}</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)', fontSize: 12 }}><XCircle size={12} />Not linked</span>}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{u._count?.payments ?? 0}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => toggleSub(u.id, u.subscriptionStatus)}
                      disabled={actionLoading === u.id}
                      className={`dx-btn dx-btn-sm ${u.subscriptionStatus === 'PRO' ? 'dx-btn-danger' : ''}`}
                      style={u.subscriptionStatus !== 'PRO' ? { color: 'var(--accent)', borderColor: 'rgba(0,255,255,0.2)', background: 'rgba(0,255,255,0.06)' } : {}}
                    >
                      {actionLoading === u.id ? '…' : u.subscriptionStatus === 'PRO' ? 'Revoke' : 'Give PRO'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--glass-border)' }}>
            <button className="dx-btn dx-btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
            <span style={{ alignSelf: 'center', fontSize: 12, color: 'var(--muted)' }}>Page {page} / {pages}</span>
            <button className="dx-btn dx-btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Payments Tab ───────────────────────────────────────────────────────────
function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, status: statusFilter });
      const res = await api(`/api/admin/payments?${params}`);
      if (res.data.ok) { setPayments(res.data.payments); setTotal(res.data.pagination.total); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const pages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ height: 40, fontSize: 13, minWidth: 140 }}>
          <option value="">All Payments</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 12, color: 'var(--muted)' }}>{total} records</span>
      </div>

      <div className="dx-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                {['User', 'Amount', 'Currency', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.05)', width: j === 0 ? 120 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{p.user?.displayName || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.user?.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ok)' }}>${p.amount}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: 12 }}>{p.currency}</td>
                  <td style={{ padding: '14px 16px' }}><Badge status={p.status} /></td>
                  <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--glass-border)' }}>
            <button className="dx-btn dx-btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
            <span style={{ alignSelf: 'center', fontSize: 12, color: 'var(--muted)' }}>Page {page} / {pages}</span>
            <button className="dx-btn dx-btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Logs Tab ───────────────────────────────────────────────────────────────
function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api('/api/admin/logs?limit=50')
      .then(r => { if (r.data.ok) setLogs(r.data.logs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dx-card" style={{ padding: 0, overflow: 'hidden' }}>
      {loading ? (
        <div style={{ padding: 24, color: 'var(--muted)', textAlign: 'center' }}>Loading logs…</div>
      ) : logs.length === 0 ? (
        <div style={{ padding: 24, color: 'var(--muted)', textAlign: 'center' }}>No audit logs yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {logs.map((log, i) => (
            <div key={log.id} style={{ display: 'flex', gap: 16, padding: '12px 20px', borderBottom: i < logs.length - 1 ? '1px solid var(--glass-border)' : 'none', alignItems: 'flex-start' }}>
              <div style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(0,255,255,0.06)', flexShrink: 0 }}>
                <FileText size={12} color="var(--accent)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{log.action}</span>
                  {log.user?.email && <span style={{ fontSize: 11, color: 'var(--muted)' }}>by {log.user.email}</span>}
                </div>
                {log.details && <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{log.details}</div>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'users',    label: 'Users',    icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'logs',     label: 'Audit Logs', icon: FileText },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api('/api/admin/stats');
      if (res.data.ok) setStats(res.data.stats);
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const statCards = stats ? [
    { label: 'Total Traders',     value: stats.totalUsers,       icon: Users,      color: '#00FFFF', sub: `+${stats.newUsersToday} today` },
    { label: 'Pro Subscribers',   value: stats.proUsers,         icon: Zap,        color: '#FFD600', sub: `${stats.conversionRate}% conv.` },
    { label: 'Total Revenue',     value: `$${stats.totalRevenue}`, icon: TrendingUp, color: '#00E396', sub: `${stats.completedPayments} txns` },
    { label: 'Pending Payments',  value: stats.pendingPayments,  icon: Clock,      color: '#FEB019' },
  ] : [];

  return (
    <div className="dx-panels">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Shield size={14} color="var(--accent)" />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(0,255,255,0.6)', textTransform: 'uppercase' }}>Protocol Authority</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(24px,5vw,36px)', fontWeight: 900, letterSpacing: -1 }}>
            Admin <span style={{ color: 'var(--accent)', textShadow: '0 0 30px rgba(0,255,255,0.4)' }}>Control Center</span>
          </h1>
          <button className="dx-btn dx-btn-sm" onClick={fetchStats} style={{ gap: 6 }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="dx-card" style={{ height: 110, background: 'rgba(255,255,255,0.02)' }} />
            ))
          : statCards.map((s, i) => <StatCard key={i} {...s} />)
        }
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--glass-border)', paddingBottom: 0 }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                color: active ? 'var(--accent)' : 'var(--muted)',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s', marginBottom: -1,
              }}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {activeTab === 'users'    && <UsersTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'logs'     && <LogsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
