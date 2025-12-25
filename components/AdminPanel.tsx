
import React, { useState } from 'react';
import { Content, User } from '../types';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash, 
  BarChart3,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminPanelProps {
  content: Content[];
  users: User[];
  onClose: () => void;
  onUpdateContent: (updated: Content[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ content, users, onClose, onUpdateContent }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'users'>('dashboard');
  const [isEditing, setIsEditing] = useState<Content | null>(null);

  const statsData = [
    { name: 'Jan', views: 4000 },
    { name: 'Feb', views: 3000 },
    { name: 'Mar', views: 5000 },
    { name: 'Apr', views: 2780 },
    { name: 'May', views: 1890 },
    { name: 'Jun', views: 2390 },
  ];

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      onUpdateContent(content.filter(c => c.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141414] z-[100] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-black p-6 flex flex-col gap-8 border-r border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-600 tracking-tighter">TURKSTREAM <span className="text-white text-xs">Admin</span></h1>
          <button onClick={onClose} className="md:hidden"><X /></button>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'content' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Film size={20} />
            Content Library
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'users' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Users size={20} />
            Users
          </button>
        </nav>

        <button className="mt-auto flex items-center gap-3 p-3 text-gray-400 hover:text-white transition">
          <Settings size={20} />
          Settings
        </button>
        
        <button onClick={onClose} className="hidden md:block w-full mt-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
          Exit Admin Mode
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold capitalize">{activeTab}</h2>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition">
              <Plus size={20} />
              Add New
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex flex-col">
              <span className="text-gray-400 text-sm font-medium">Total Views</span>
              <span className="text-4xl font-bold mt-2">1,284,392</span>
              <span className="text-green-500 text-xs mt-2">+12.5% from last month</span>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex flex-col">
              <span className="text-gray-400 text-sm font-medium">Active Users</span>
              <span className="text-4xl font-bold mt-2">48,291</span>
              <span className="text-green-500 text-xs mt-2">+5.2% from last month</span>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex flex-col">
              <span className="text-gray-400 text-sm font-medium">Revenue (Est.)</span>
              <span className="text-4xl font-bold mt-2">$0.00</span>
              <span className="text-gray-500 text-xs mt-2">Platform is Free</span>
            </div>

            <div className="col-span-1 md:col-span-3 bg-gray-900/50 border border-gray-800 p-6 rounded-2xl h-[400px]">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BarChart3 size={20} />
                Watch Time Analytics
              </h3>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    cursor={{ fill: '#ffffff10' }}
                  />
                  <Bar dataKey="views" fill="#e50914" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/50 border-b border-gray-800">
                <tr>
                  <th className="p-4 text-gray-400 font-medium">Title</th>
                  <th className="p-4 text-gray-400 font-medium">Type</th>
                  <th className="p-4 text-gray-400 font-medium">Year</th>
                  <th className="p-4 text-gray-400 font-medium">Genres</th>
                  <th className="p-4 text-gray-400 font-medium">Rating</th>
                  <th className="p-4 text-gray-400 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {content.map(item => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.thumbnail} className="w-12 h-16 object-cover rounded" alt="" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{item.type}</td>
                    <td className="p-4">{item.year}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {item.genres.slice(0, 2).map(g => (
                          <span key={g} className="text-xs bg-gray-800 px-2 py-1 rounded">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">{item.rating}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-blue-600/20 text-blue-500 rounded-lg transition">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-600/20 text-red-600 rounded-lg transition"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-center h-[200px] text-gray-500 italic">
              User account management is coming soon...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
