import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  CreditCard, 
  Shield, 
  TrendingUp, 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle,
  Calendar,
  Zap
} from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, proUsers: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/stats')
      ]);
      if (usersRes.data.ok) setUsers(usersRes.data.users);
      if (statsRes.data.ok) setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (userId, status) => {
    try {
      const res = await axios.patch(`/api/admin/users/${userId}/subscription`, { status });
      if (res.data.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: status } : u));
      }
    } catch (error) {
      alert('Failed to update subscription');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telegramId?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00FFFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-[#00FFFF]" />
          <span className="text-sm font-semibold uppercase tracking-widest text-[#00FFFF]/60">Protocol Authority</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Admin <span className="text-[#00FFFF] glow-text">Control Center</span></h1>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Total Traders', value: stats.totalUsers, icon: <Users />, color: 'text-blue-400' },
          { label: 'Pro Subscriptions', value: stats.proUsers, icon: <Zap />, color: 'text-yellow-400' },
          { label: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: <TrendingUp />, color: 'text-green-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                {React.cloneElement(stat.icon, { size: 24 })}
              </div>
            </div>
            <div className="text-3xl font-black mb-1">{stat.value}</div>
            <div className="text-white/40 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* User Management Section */}
      <div className="max-w-7xl mx-auto glass-panel rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Users className="text-[#00FFFF]" />
            User Management
          </h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text"
              placeholder="Search by email, name or Telegram ID..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#00FFFF]/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-white/40 text-xs uppercase tracking-widest font-semibold">
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Telegram</th>
                <th className="px-8 py-4">Joined</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center font-bold text-[#00FFFF]">
                        {user.displayName?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white/90">{user.displayName || 'Unnamed Trader'}</div>
                        <div className="text-sm text-white/40">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.subscriptionStatus === 'PRO' 
                        ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' 
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      {user.subscriptionStatus === 'PRO' && <Zap size={12} />}
                      {user.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-white/50">
                    {user.telegramId ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500" />
                        {user.telegramId}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <XCircle size={14} className="text-white/20" />
                        Not Linked
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-sm text-white/40 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {user.subscriptionStatus !== 'PRO' ? (
                        <button 
                          onClick={() => handleUpdateSubscription(user.id, 'PRO')}
                          className="px-4 py-2 bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF]/20 rounded-lg text-xs font-bold transition-all"
                        >
                          GIVE PRO
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateSubscription(user.id, 'FREE')}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-all"
                        >
                          REVOKE
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
