
import React, { useState, useMemo } from 'react';
import { Content, User, ContentType, Episode } from '../types';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash, 
  BarChart3,
  X,
  Search,
  Save,
  Lock,
  ArrowLeft,
  Tv,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminPanelProps {
  content: Content[];
  users: User[];
  onClose: () => void;
  onUpdateContent: (updated: Content[]) => void;
  onSave: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ content, users, onClose, onUpdateContent, onSave }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');

  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'users'>('dashboard');
  const [editingItem, setEditingItem] = useState<Partial<Content> | null>(null);
  const [managingEpisodesOf, setManagingEpisodesOf] = useState<Content | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<Partial<Episode> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Dashboard Stats
  const stats = useMemo(() => {
    return {
      total: content.length,
      movies: content.filter(c => c.type === 'movie').length,
      series: content.filter(c => c.type === 'series').length,
      avgRating: content.length > 0 ? (content.reduce((acc, c) => acc + c.rating, 0) / content.length).toFixed(1) : '0'
    };
  }, [content]);

  const filteredContent = useMemo(() => {
    return content.filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [content, searchTerm]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCreds.user === 'admin' && loginCreds.pass === 'turkstream2025') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  // Content Handlers
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      onUpdateContent(content.filter(c => c.id !== id));
    }
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.id) {
      onUpdateContent(content.map(c => c.id === editingItem.id ? (editingItem as Content) : c));
    } else {
      const newItem: Content = {
        ...editingItem as Content,
        id: Math.random().toString(36).substr(2, 9),
        comments: [],
        episodes: editingItem.type === 'series' ? [] : undefined
      };
      onUpdateContent([...content, newItem]);
    }
    setEditingItem(null);
  };

  // Episode Handlers
  const handleSaveEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingEpisodesOf || !editingEpisode) return;

    const currentEpisodes = managingEpisodesOf.episodes || [];
    let updatedEpisodes: Episode[];

    if (editingEpisode.id) {
      updatedEpisodes = currentEpisodes.map(ep => ep.id === editingEpisode.id ? (editingEpisode as Episode) : ep);
    } else {
      const newEp: Episode = {
        ...editingEpisode as Episode,
        id: Math.random().toString(36).substr(2, 9)
      };
      updatedEpisodes = [...currentEpisodes, newEp];
    }

    const updatedSeries = { ...managingEpisodesOf, episodes: updatedEpisodes };
    onUpdateContent(content.map(c => c.id === managingEpisodesOf.id ? updatedSeries : c));
    setManagingEpisodesOf(updatedSeries);
    setEditingEpisode(null);
  };

  const handleDeleteEpisode = (episodeId: string) => {
    if (!managingEpisodesOf || !window.confirm('Delete this episode?')) return;
    const updatedEpisodes = (managingEpisodesOf.episodes || []).filter(ep => ep.id !== episodeId);
    const updatedSeries = { ...managingEpisodesOf, episodes: updatedEpisodes };
    onUpdateContent(content.map(c => c.id === managingEpisodesOf.id ? updatedSeries : c));
    setManagingEpisodesOf(updatedSeries);
  };

  // Login View
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-red-600 tracking-tighter mb-2">TURKSTREAM</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Secure Admin Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 ml-1">Username</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-white" 
                placeholder="admin"
                value={loginCreds.user}
                onChange={e => setLoginCreds({...loginCreds, user: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 ml-1">Password</label>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-white" 
                placeholder="••••••••"
                value={loginCreds.pass}
                onChange={e => setLoginCreds({...loginCreds, pass: e.target.value})}
              />
            </div>
            {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-black text-lg transition shadow-xl shadow-red-600/20 flex items-center justify-center gap-3">
              <Lock size={20} />
              Unlock Console
            </button>
          </form>
          <button onClick={onClose} className="w-full mt-6 text-gray-500 hover:text-white transition text-sm font-bold">Return to Website</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#070707] z-[100] flex flex-col md:flex-row overflow-hidden text-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-black p-8 flex flex-col gap-10 border-r border-white/5">
        <div>
          <h1 className="text-2xl font-black text-red-600 tracking-tighter leading-none">TURKSTREAM</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white/40 text-[10px] uppercase tracking-widest font-black">Authorized Session</span>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
            { id: 'content', icon: Film, label: 'Library' },
            { id: 'users', icon: Users, label: 'Accounts' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setManagingEpisodesOf(null); }}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon size={22} />
              <span className="font-bold">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-black">A</div>
            <div>
              <p className="text-sm font-bold">System Admin</p>
              <p className="text-[10px] text-gray-500">Root Access</p>
            </div>
          </div>
          <button 
            onClick={onSave}
            className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-2xl transition font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Changes
          </button>
          <button onClick={onClose} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-red-600 transition font-black text-sm uppercase tracking-widest">
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        {!managingEpisodesOf ? (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h2 className="text-5xl font-black capitalize tracking-tighter">{activeTab}</h2>
                <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm font-medium">
                  <span className="hover:text-white cursor-pointer">Main Console</span>
                  <ChevronRight size={14} />
                  <span className="text-gray-300 capitalize">{activeTab}</span>
                </div>
              </div>
              {activeTab === 'content' && (
                <button 
                  onClick={() => setEditingItem({ title: '', type: 'movie', year: 2024, rating: 4.5, genres: [], description: '', thumbnail: '', backdrop: '' })}
                  className="flex items-center gap-3 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-2xl font-black transition shadow-2xl shadow-red-600/40 animate-in slide-in-from-right-10"
                >
                  <Plus size={20} />
                  Add Title
                </button>
              )}
            </header>

            {activeTab === 'dashboard' && (
              <div className="space-y-10 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Platform Assets', value: stats.total, color: 'text-white' },
                    { label: 'Active Movies', value: stats.movies, color: 'text-blue-500' },
                    { label: 'TV Series', value: stats.series, color: 'text-purple-500' },
                    { label: 'System Rating', value: stats.avgRating, color: 'text-yellow-500' },
                  ].map((s, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-[32px] hover:border-white/20 transition-all hover:-translate-y-1">
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
                      <div className={`text-6xl font-black mt-2 ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white/5 border border-white/10 p-10 rounded-[40px]">
                    <h3 className="text-2xl font-black mb-10 flex items-center gap-3">
                      <BarChart3 size={24} className="text-red-600" />
                      Stream Analytics
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ name: 'Mon', val: 2400 }, { name: 'Tue', val: 1398 }, { name: 'Wed', val: 9800 }, { name: 'Thu', val: 3908 }, { name: 'Fri', val: 4800 }, { name: 'Sat', val: 3800 }, { name: 'Sun', val: 4300 }]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                          <XAxis dataKey="name" stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px' }} />
                          <Bar dataKey="val" fill="#e50914" radius={[8, 8, 0, 0]} barSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-10 rounded-[40px]">
                    <h3 className="text-2xl font-black mb-8">Live Logs</h3>
                    <div className="space-y-6">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-gray-200">User logged in from Istanbul</p>
                            <p className="text-[10px] text-gray-600 uppercase font-black">Just now • Webhook 204</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden animate-in fade-in duration-500">
                <table className="w-full text-left">
                  <thead className="bg-black/40 border-b border-white/10">
                    <tr>
                      <th className="p-5 text-gray-500 text-xs font-bold uppercase tracking-widest">User</th>
                      <th className="p-5 text-gray-500 text-xs font-bold uppercase tracking-widest">Role</th>
                      <th className="p-5 text-gray-500 text-xs font-bold uppercase tracking-widest">History</th>
                      <th className="p-5 text-gray-500 text-xs font-bold uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <img src={user.profilePic} className="w-10 h-10 rounded-full object-cover" alt="" />
                            <div>
                              <p className="font-bold">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 font-medium uppercase text-xs">{user.role}</td>
                        <td className="p-5">
                          <span className="text-sm text-gray-400">{user.history.length} items watched</span>
                        </td>
                        <td className="p-5 text-right">
                          <button className="text-gray-500 hover:text-white px-4 py-2 bg-white/5 rounded-lg text-xs font-bold">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-600 transition-colors" size={24} />
                  <input 
                    type="text" 
                    placeholder="Search global library..." 
                    className="w-full bg-white/5 border border-white/10 rounded-[24px] py-6 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-xl font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-black/60 border-b border-white/10">
                      <tr>
                        <th className="p-8 text-gray-500 text-[10px] font-black uppercase tracking-widest">Master Asset</th>
                        <th className="p-8 text-gray-500 text-[10px] font-black uppercase tracking-widest text-center">Stats</th>
                        <th className="p-8 text-gray-500 text-[10px] font-black uppercase tracking-widest text-right">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredContent.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition">
                          <td className="p-8">
                            <div className="flex items-center gap-6">
                              <img src={item.thumbnail} className="w-16 h-24 object-cover rounded-xl shadow-2xl ring-1 ring-white/10" alt="" />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${item.type === 'series' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>{item.type}</span>
                                  <span className="text-gray-600 text-[10px] font-bold">{item.year}</span>
                                </div>
                                <h4 className="text-2xl font-black tracking-tight">{item.title}</h4>
                                <p className="text-sm text-gray-500 mt-1 max-w-sm line-clamp-1">{item.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-8 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-3xl font-black text-yellow-500">{item.rating}</span>
                              <span className="text-[10px] text-gray-600 font-black uppercase">IMDB Score</span>
                            </div>
                          </td>
                          <td className="p-8 text-right">
                            <div className="flex justify-end gap-3">
                              {item.type === 'series' && (
                                <button 
                                  onClick={() => setManagingEpisodesOf(item)}
                                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-2xl transition font-bold"
                                >
                                  <Tv size={18} />
                                  Manage Episodes
                                </button>
                              )}
                              <button 
                                onClick={() => setEditingItem(item)}
                                className="p-4 bg-white/5 hover:bg-blue-600/20 text-blue-500 rounded-2xl transition"
                              >
                                <Edit size={20} />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-4 bg-white/5 hover:bg-red-600/20 text-red-600 rounded-2xl transition"
                              >
                                <Trash size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="animate-in slide-in-from-left-10 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setManagingEpisodesOf(null)}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-5xl font-black tracking-tighter">{managingEpisodesOf.title}</h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Episode Management Console</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingEpisode({ 
                  title: '', 
                  description: '', 
                  thumbnail: '', 
                  videoUrl: '', 
                  seasonNumber: 1, 
                  episodeNumber: (managingEpisodesOf.episodes?.length || 0) + 1,
                  duration: '45m'
                })}
                className="flex items-center gap-3 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-2xl font-black transition shadow-2xl shadow-red-600/40"
              >
                <Plus size={20} />
                Add Episode
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(managingEpisodesOf.episodes || []).map((ep) => (
                <div key={ep.id} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden group hover:border-red-600/30 transition-all flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src={ep.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                    <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                      S{ep.seasonNumber} : E{ep.episodeNumber}
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="text-white" size={32} />
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-black line-clamp-1">{ep.title}</h4>
                      <span className="text-[10px] text-gray-500 font-bold">{ep.duration}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-6">{ep.description}</p>
                    <div className="mt-auto flex gap-2">
                      <button 
                        onClick={() => setEditingEpisode(ep)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition flex items-center justify-center gap-2"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteEpisode(ep.id)}
                        className="px-4 bg-white/5 hover:bg-red-600/20 text-red-600 rounded-xl transition flex items-center justify-center"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(managingEpisodesOf.episodes || []).length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px] text-gray-600">
                  <Tv size={64} strokeWidth={1} className="mb-4" />
                  <p className="text-xl font-bold">No episodes found for this series.</p>
                  <p className="text-sm">Start by adding your first episode above.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-3xl rounded-[40px] shadow-[0_0_100px_rgba(229,9,20,0.15)] overflow-hidden animate-in zoom-in fade-in duration-300">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-red-600/10 to-transparent">
              <div>
                <h3 className="text-4xl font-black tracking-tighter">{editingItem.id ? 'Edit Title' : 'New Title'}</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Content Production Hub</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-4 hover:bg-white/5 rounded-full transition"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSaveContent} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Title</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-red-600" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Format</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-red-600 appearance-none" value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value as ContentType})}>
                    <option value="movie">Feature Film</option>
                    <option value="series">TV Series</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Release Year</label>
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-red-600" value={editingItem.year} onChange={e => setEditingItem({...editingItem, year: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">IMDB Score</label>
                  <input type="number" step="0.1" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-red-600" value={editingItem.rating} onChange={e => setEditingItem({...editingItem, rating: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cover URL (Portrait)</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-red-600" value={editingItem.thumbnail} onChange={e => setEditingItem({...editingItem, thumbnail: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Plot Summary</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 focus:ring-2 focus:ring-red-600 resize-none" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 py-6 rounded-3xl font-black text-xl transition shadow-2xl shadow-red-600/30">Commit Changes</button>
                <button type="button" onClick={() => setEditingItem(null)} className="px-12 bg-white/5 hover:bg-white/10 rounded-3xl font-bold transition">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Episode Editor Modal */}
      {editingEpisode && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-3xl rounded-[40px] shadow-3xl overflow-hidden animate-in zoom-in fade-in duration-300">
            <div className="p-10 border-b border-white/5 bg-gradient-to-r from-purple-600/10 to-transparent flex justify-between items-center">
              <div>
                <h3 className="text-4xl font-black tracking-tighter">{editingEpisode.id ? 'Modify Episode' : 'New Episode'}</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Series Sequence Manager</p>
              </div>
              <button onClick={() => setEditingEpisode(null)} className="p-4 hover:bg-white/5 rounded-full transition"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSaveEpisode} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Episode Title</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-purple-600" value={editingEpisode.title} onChange={e => setEditingEpisode({...editingEpisode, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1">S / E</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="S" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center" value={editingEpisode.seasonNumber} onChange={e => setEditingEpisode({...editingEpisode, seasonNumber: parseInt(e.target.value)})} />
                    <input type="number" placeholder="E" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center" value={editingEpisode.episodeNumber} onChange={e => setEditingEpisode({...editingEpisode, episodeNumber: parseInt(e.target.value)})} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Video Source (Dailymotion/Direct Link)</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-purple-600" placeholder="https://..." value={editingEpisode.videoUrl} onChange={e => setEditingEpisode({...editingEpisode, videoUrl: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Thumbnail URL</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-purple-600" value={editingEpisode.thumbnail} onChange={e => setEditingEpisode({...editingEpisode, thumbnail: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Episode Description</label>
                <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 focus:ring-2 focus:ring-purple-600 resize-none" value={editingEpisode.description} onChange={e => setEditingEpisode({...editingEpisode, description: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 py-6 rounded-3xl font-black text-xl transition shadow-2xl shadow-purple-600/30">Update Sequence</button>
                <button type="button" onClick={() => setEditingEpisode(null)} className="px-12 bg-white/5 hover:bg-white/10 rounded-3xl font-bold transition">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
