
import React, { useState, useEffect, useMemo } from 'react';
import { Content, User, Episode, Comment } from './types';
import { mockContent } from './data/mockData';
import ContentRow from './components/ContentRow';
import AdminPanel from './components/AdminPanel';
import { getPersonalizedRecommendations } from './services/geminiService';
import { 
  Play, 
  Info, 
  Search, 
  Bell, 
  User as UserIcon, 
  X, 
  Plus, 
  Check, 
  ThumbsUp, 
  MessageCircle,
  LogOut,
  ChevronDown,
  Lock,
  Star,
  Send
} from 'lucide-react';

// Mock Profiles Initial Data
const INITIAL_PROFILES: User[] = [
  {
    id: 'p1',
    name: 'Mustafa',
    email: 'mustafa@turkstream.com',
    profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200',
    watchlist: ['1', '3'],
    history: ['2', '4'],
    role: 'admin'
  },
  {
    id: 'p2',
    name: 'Zeynep',
    email: 'zeynep@turkstream.com',
    profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200',
    watchlist: ['2', '5'],
    history: ['1'],
    role: 'user'
  },
  {
    id: 'p3',
    name: 'Emre',
    email: 'emre@turkstream.com',
    profilePic: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&h=200',
    watchlist: [],
    history: [],
    role: 'user'
  },
  {
    id: 'p4',
    name: 'Kids',
    email: 'kids@turkstream.com',
    profilePic: 'https://images.unsplash.com/photo-1566004100631-35d015d479d9?auto=format&fit=crop&w=200&h=200',
    watchlist: ['7'],
    history: ['7'],
    role: 'user'
  }
];

const App: React.FC = () => {
  // --- STATE ---
  const [contentList, setContentList] = useState<Content[]>(() => {
    try {
      const saved = localStorage.getItem('turkstream_content');
      return saved ? JSON.parse(saved) : mockContent;
    } catch (e) {
      console.error("Failed to load content", e);
      return mockContent;
    }
  });

  const [profiles, setProfiles] = useState<User[]>(() => {
     try {
      const saved = localStorage.getItem('turkstream_profiles');
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [playingContent, setPlayingContent] = useState<Content | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [recommendations, setRecommendations] = useState<Content[]>([]);
  
  // Comment State
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentRating, setNewCommentRating] = useState(5);

  // --- MEMOIZED FILTERS ---
  const movies = useMemo(() => contentList.filter(c => c.type === 'movie'), [contentList]);
  const series = useMemo(() => contentList.filter(c => c.type === 'series'), [contentList]);
  const popular = useMemo(() => contentList.filter(c => c.isPopular), [contentList]);
  const newReleases = useMemo(() => contentList.filter(c => c.isNew), [contentList]);
  
  const continueWatching = useMemo(() => {
    if (!currentUser) return [];
    return contentList.filter(c => currentUser.history.includes(c.id));
  }, [currentUser, contentList]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return contentList.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, contentList]);

  // --- EFFECTS ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync profiles to local storage
  useEffect(() => {
    localStorage.setItem('turkstream_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // AI Recommendations
  useEffect(() => {
    const fetchRecs = async () => {
      if (currentUser && currentUser.history.length > 0) {
        const recIds = await getPersonalizedRecommendations(currentUser.history, contentList);
        const recs = contentList.filter(c => recIds.includes(c.id));
        setRecommendations(recs);
      }
    };
    fetchRecs();
  }, [currentUser, contentList]);

  // --- HANDLERS ---
  const handleSave = () => {
    try {
      localStorage.setItem('turkstream_content', JSON.stringify(contentList));
      localStorage.setItem('turkstream_profiles', JSON.stringify(profiles));
      alert("System database saved successfully to local storage.");
    } catch (e) {
      alert("Failed to save changes.");
    }
  };

  const updateCurrentUser = (updated: User) => {
    setCurrentUser(updated);
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const toggleWatchlist = (id: string) => {
    if (!currentUser) return;
    const exists = currentUser.watchlist.includes(id);
    const updatedUser = {
      ...currentUser,
      watchlist: exists ? currentUser.watchlist.filter(wId => wId !== id) : [...currentUser.watchlist, id]
    };
    updateCurrentUser(updatedUser);
  };

  const handlePlay = (content: Content, episode?: Episode) => {
    setPlayingContent(content);
    setPlayingEpisode(episode || (content.type === 'series' && content.episodes ? content.episodes[0] : null));
    setActiveContent(null);
    if (currentUser && !currentUser.history.includes(content.id)) {
      const updatedUser = { ...currentUser, history: [content.id, ...currentUser.history] };
      updateCurrentUser(updatedUser);
    }
  };

  const handleAddComment = () => {
    if (!currentUser || !activeContent || !newCommentText.trim()) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      text: newCommentText,
      rating: newCommentRating,
      date: new Date().toLocaleDateString()
    };

    const updatedContent = {
      ...activeContent,
      comments: [newComment, ...(activeContent.comments || [])]
    };

    // Update List
    const updatedList = contentList.map(c => c.id === activeContent.id ? updatedContent : c);
    setContentList(updatedList);
    setActiveContent(updatedContent); // Update modal view
    
    // Reset Form
    setNewCommentText('');
    setNewCommentRating(5);
  };

  const FeaturedHero = () => {
    const featured = contentList[0];
    if (!featured) return null;
    return (
      <div className="relative h-[60vh] md:h-[85vh] w-full animate-in fade-in duration-1000">
        <img 
          src={featured.backdrop} 
          alt={featured.title}
          className="w-full h-full object-cover brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-12 md:bottom-24 left-4 md:left-12 max-w-3xl px-4 space-y-6">
          <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-sm border border-red-600/30 px-3 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">#1 in Turkey Today</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">{featured.title}</h1>
          <p className="text-sm md:text-xl line-clamp-3 md:line-clamp-none text-gray-200 font-medium leading-relaxed max-w-2xl">{featured.description}</p>
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => handlePlay(featured)}
              className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-black hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
            >
              <Play fill="black" size={24} /> Play
            </button>
            <button 
              onClick={() => setActiveContent(featured)}
              className="flex items-center gap-3 bg-gray-500/30 backdrop-blur-md text-white px-8 py-4 rounded-xl font-black hover:bg-gray-500/50 transition-all hover:scale-105 active:scale-95 border border-white/10"
            >
              <Info size={24} /> More Info
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- PROFILE SELECTOR ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center animate-in fade-in duration-700">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-16 tracking-tighter">Who's watching?</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {profiles.map(profile => (
            <div 
              key={profile.id} 
              className="group flex flex-col items-center gap-4 cursor-pointer"
              onClick={() => setCurrentUser(profile)}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden ring-4 ring-transparent group-hover:ring-white transition-all duration-300 relative">
                <img src={profile.profilePic} className="w-full h-full object-cover" alt={profile.name} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
              <span className="text-gray-400 group-hover:text-white font-bold text-xl transition-colors">{profile.name}</span>
            </div>
          ))}
          <div className="group flex flex-col items-center gap-4 cursor-pointer">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-md bg-white/10 flex items-center justify-center ring-4 ring-transparent group-hover:ring-white transition-all duration-300 hover:bg-white/20">
               <Plus size={48} className="text-gray-400 group-hover:text-white" />
             </div>
             <span className="text-gray-400 group-hover:text-white font-bold text-xl transition-colors">Add Profile</span>
          </div>
        </div>
        <button className="mt-20 px-8 py-2 border border-gray-500 text-gray-500 hover:text-white hover:border-white tracking-widest uppercase font-bold text-sm transition-all">
          Manage Profiles
        </button>
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 font-sans">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 flex items-center justify-between px-4 md:px-12 py-4 ${isScrolled ? 'bg-black/95 shadow-2xl backdrop-blur-md' : 'bg-transparent bg-gradient-to-b from-black/95 to-transparent'}`}>
        <div className="flex items-center gap-4 md:gap-12">
          <h1 className="text-2xl md:text-3xl font-black text-red-600 tracking-tighter cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>TURKSTREAM</h1>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <a href="#" className="hover:text-white transition">Home</a>
            <a href="#" className="hover:text-white transition">Series</a>
            <a href="#" className="hover:text-white transition">Movies</a>
            <a href="#" className="hover:text-white transition">New & Popular</a>
            <a href="#" className="hover:text-white transition">My List</a>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative flex items-center group">
            <Search className="absolute left-4 w-4 h-4 text-gray-400 group-focus-within:text-red-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..."
              className="bg-black/50 border border-white/20 pl-12 pr-4 py-2 rounded-full text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all w-8 md:w-64 focus:w-64 font-medium backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative group z-50">
            <div className="flex items-center gap-3 cursor-pointer p-1 rounded-md hover:bg-white/10 transition">
              <img src={currentUser.profilePic} className="w-8 h-8 rounded-md border border-white/20" alt="profile" />
              <ChevronDown className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-300" />
            </div>
            
            <div className="absolute right-0 mt-2 w-56 bg-black/95 border border-white/10 rounded-xl shadow-2xl hidden group-hover:block overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 backdrop-blur-xl">
              <div className="p-4 border-b border-white/5 flex flex-col gap-2">
                {profiles.filter(p => p.id !== currentUser.id).map(p => (
                  <div key={p.id} className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-lg cursor-pointer transition" onClick={() => setCurrentUser(p)}>
                    <img src={p.profilePic} className="w-6 h-6 rounded-md" alt="" />
                    <span className="text-xs font-bold text-gray-300 hover:text-white">{p.name}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 space-y-1">
                <button className="w-full text-left px-4 py-3 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition flex items-center gap-3">
                  <UserIcon size={14} /> Account
                </button>
                <button className="w-full text-left px-4 py-3 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition flex items-center gap-3" onClick={() => setCurrentUser(null)}>
                  <LogOut size={14} /> Switch Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main UI */}
      {!searchQuery ? (
        <>
          <FeaturedHero />
          <div className="-mt-12 md:-mt-32 relative z-20 pb-24 space-y-8 pl-0">
            {continueWatching.length > 0 && (
               <ContentRow title={`Continue Watching for ${currentUser.name}`} items={continueWatching} onMoreInfo={setActiveContent} onPlay={handlePlay} watchlist={currentUser.watchlist} onToggleWatchlist={toggleWatchlist} />
            )}
            {recommendations.length > 0 && (
              <ContentRow title="Recommended For You" items={recommendations} onMoreInfo={setActiveContent} onPlay={handlePlay} watchlist={currentUser.watchlist} onToggleWatchlist={toggleWatchlist} />
            )}
            <ContentRow title="Trending Now" items={popular} onMoreInfo={setActiveContent} onPlay={handlePlay} watchlist={currentUser.watchlist} onToggleWatchlist={toggleWatchlist} />
            <ContentRow title="New Releases" items={newReleases} onMoreInfo={setActiveContent} onPlay={handlePlay} watchlist={currentUser.watchlist} onToggleWatchlist={toggleWatchlist} />
            <ContentRow title="TV Shows" items={series} onMoreInfo={setActiveContent} onPlay={handlePlay} watchlist={currentUser.watchlist} onToggleWatchlist={toggleWatchlist} />
            <ContentRow title="Movies" items={movies} onMoreInfo={setActiveContent} onPlay={handlePlay} watchlist={currentUser.watchlist} onToggleWatchlist={toggleWatchlist} />
          </div>
        </>
      ) : (
        <div className="pt-32 px-4 md:px-12 animate-in fade-in duration-500 min-h-screen">
          <h2 className="text-3xl font-black mb-10 tracking-tighter">Results for <span className="text-red-600">"{searchQuery}"</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {searchResults.map(item => (
              <div key={item.id} className="cursor-pointer group flex flex-col gap-3" onClick={() => setActiveContent(item)}>
                <div className="relative h-[400px] overflow-hidden rounded-2xl ring-1 ring-white/10 group-hover:ring-red-600 transition-all">
                  <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="fill-white" size={48} />
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-lg tracking-tight group-hover:text-red-600 transition-colors">{item.title}</h4>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{item.year} • {item.type}</p>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500 font-bold italic">No matching content found. Try different keywords.</div>
            )}
          </div>
        </div>
      )}

      {/* Modals & Overlays */}
      {activeContent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto animate-in zoom-in fade-in duration-300">
          <div className="bg-[#121212] w-full max-w-5xl rounded-[40px] overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 my-8">
            <button onClick={() => setActiveContent(null)} className="absolute top-8 right-8 z-[70] p-4 bg-black/60 backdrop-blur-md rounded-full hover:bg-red-600 transition-all text-white shadow-xl group"><X size={32} className="group-hover:rotate-90 transition-transform" /></button>

            <div className="relative h-[500px]">
              <img src={activeContent.backdrop} className="w-full h-full object-cover brightness-75" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
              <div className="absolute bottom-12 left-12 right-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-red-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Premium</span>
                  <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{activeContent.year}</span>
                  <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{activeContent.type}</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">{activeContent.title}</h2>
                <div className="flex gap-4">
                  <button onClick={() => handlePlay(activeContent)} className="bg-white text-black px-12 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-gray-300 transition-all text-xl shadow-2xl hover:scale-105 active:scale-95"><Play fill="black" size={24} /> Watch</button>
                  <button onClick={() => toggleWatchlist(activeContent.id)} className={`p-4 rounded-2xl border-2 ${currentUser.watchlist.includes(activeContent.id) ? 'border-red-600 text-red-600 bg-red-600/10' : 'border-white/20 text-white'} hover:border-white transition-all flex items-center justify-center hover:scale-105 active:scale-95`}>
                    {currentUser.watchlist.includes(activeContent.id) ? <Check size={28} /> : <Plus size={28} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-16 bg-[#121212]">
              <div className="md:col-span-2 space-y-12">
                {/* Meta & Desc */}
                <div className="space-y-6">
                   <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-4xl font-black text-green-400">{Math.round(activeContent.rating * 20)}%</span>
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">Match Rate</span>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-4xl font-black text-yellow-500">{activeContent.rating}</span>
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">IMDB Score</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-xl font-medium leading-relaxed">{activeContent.description}</p>
                </div>
                
                {/* Episodes */}
                {activeContent.type === 'series' && activeContent.episodes && (
                  <div className="pt-6 border-t border-white/5">
                    <h3 className="text-3xl font-black mb-8 flex items-center justify-between">Episodes <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-600">Season 1</span></h3>
                    <div className="space-y-4">
                      {activeContent.episodes.map((ep, i) => (
                        <div key={ep.id} className="flex items-center gap-6 p-6 rounded-3xl hover:bg-white/5 group cursor-pointer border border-transparent hover:border-white/5 transition-all" onClick={() => handlePlay(activeContent, ep)}>
                          <span className="text-3xl font-black text-gray-700 min-w-[40px] group-hover:text-red-600 transition-colors">{i + 1}</span>
                          <div className="relative w-48 h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                            <img src={ep.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="fill-white" size={32} /></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-black text-lg tracking-tight group-hover:text-red-600 transition-colors">{ep.title}</h4>
                              <span className="text-gray-600 font-bold text-xs uppercase">{ep.duration}</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{ep.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews / Comments Section */}
                <div className="pt-6 border-t border-white/5">
                   <h3 className="text-3xl font-black mb-8 flex items-center gap-3">Reviews <span className="text-sm font-black text-gray-600 bg-white/5 px-2 py-1 rounded-md">{activeContent.comments?.length || 0}</span></h3>
                   
                   {/* Add Comment */}
                   <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5 focus-within:border-white/20 transition-colors">
                      <div className="flex items-start gap-4">
                        <img src={currentUser.profilePic} className="w-10 h-10 rounded-full" alt="" />
                        <div className="flex-1 space-y-4">
                           <textarea 
                             placeholder="Write a review..." 
                             className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 resize-none min-h-[80px]"
                             value={newCommentText}
                             onChange={(e) => setNewCommentText(e.target.value)}
                           />
                           <div className="flex justify-between items-center pt-4 border-t border-white/5">
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(star => (
                                  <Star 
                                    key={star} 
                                    size={20} 
                                    className={`cursor-pointer transition-colors ${star <= newCommentRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
                                    onClick={() => setNewCommentRating(star)}
                                  />
                                ))}
                              </div>
                              <button 
                                onClick={handleAddComment}
                                disabled={!newCommentText.trim()}
                                className="bg-white text-black px-6 py-2 rounded-xl font-black text-sm hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                Post <Send size={14} />
                              </button>
                           </div>
                        </div>
                      </div>
                   </div>

                   {/* List Comments */}
                   <div className="space-y-6">
                      {activeContent.comments && activeContent.comments.length > 0 ? (
                        activeContent.comments.map(comment => (
                          <div key={comment.id} className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center font-bold text-xs ring-1 ring-white/10">
                               {comment.userName[0]}
                             </div>
                             <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="font-bold text-sm">{comment.userName}</span>
                                   <span className="text-[10px] text-gray-500">• {comment.date}</span>
                                </div>
                                <div className="flex gap-0.5 mb-2">
                                  {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= comment.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700'} />)}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                             </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 italic text-sm">No reviews yet. Be the first to share your thoughts!</p>
                      )}
                   </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-12">
                <div>
                  <h4 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Cast Members</h4>
                  <p className="text-sm text-gray-300 font-bold leading-relaxed">Cagatay Ulusoy, Ayça Ayşin Turan, Hazar Ergüçlü, Engin Öztürk</p>
                </div>
                <div>
                  <h4 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Genre Tags</h4>
                  <div className="flex flex-wrap gap-2">{activeContent.genres.map(g => <span key={g} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase border border-white/10">{g}</span>)}</div>
                </div>
                <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 space-y-6">
                  <h4 className="font-black flex items-center gap-3 text-lg"><ThumbsUp size={20} className="text-red-600" /> Community</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-black">{activeContent.rating}</span>
                    <div className="flex flex-col"><div className="flex gap-1">{[1,2,3,4,5].map(s => <div key={s} className={`w-2 h-2 rounded-full ${s <= Math.floor(activeContent.rating) ? 'bg-red-600' : 'bg-gray-800'}`} />)}</div><span className="text-[10px] font-black uppercase text-gray-600 mt-2">{activeContent.comments?.length || 0} Reviews</span></div>
                  </div>
                  <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-3"><MessageCircle size={18} /> Discussion Board</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {playingContent && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500">
          <div className="absolute top-0 w-full p-8 flex justify-between items-center bg-gradient-to-b from-black to-transparent z-[110]">
            <div className="flex items-center gap-6">
              <button onClick={() => setPlayingContent(null)} className="p-4 hover:bg-white/10 rounded-full transition-all"><X size={40} /></button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Currently Streaming</span>
                <h3 className="text-2xl font-black tracking-tight">{playingContent.title} {playingEpisode && ` • Season ${playingEpisode.seasonNumber} Episode ${playingEpisode.episodeNumber}`}</h3>
              </div>
            </div>
          </div>
          <div className="w-full h-full relative">
            <iframe src={playingEpisode?.videoUrl || playingContent.trailerUrl} className="w-full h-full border-none" allowFullScreen allow="autoplay; encrypted-media" />
          </div>
        </div>
      )}

      {showAdmin && (
        <AdminPanel 
          content={contentList} 
          users={profiles} 
          onClose={() => setShowAdmin(false)} 
          onUpdateContent={setContentList} 
          onSave={handleSave}
        />
      )}

      {/* Modern Footer */}
      <footer className="bg-black pt-32 pb-20 px-4 md:px-12 border-t border-white/5 text-gray-600 font-bold">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
            <h2 className="text-3xl font-black text-red-600 tracking-tighter">TURKSTREAM</h2>
            <div className="flex gap-8 text-white text-[10px] uppercase tracking-widest">
              <span className="hover:text-red-600 transition cursor-pointer">Instagram</span>
              <span className="hover:text-red-600 transition cursor-pointer">Twitter (X)</span>
              <span className="hover:text-red-600 transition cursor-pointer">Letterboxd</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-[10px] uppercase tracking-widest mb-20">
            <div className="flex flex-col gap-5"><a href="#" className="hover:text-white transition">Audio description</a><a href="#" className="hover:text-white transition">Investor info</a><a href="#" className="hover:text-white transition">Legal notices</a></div>
            <div className="flex flex-col gap-5"><a href="#" className="hover:text-white transition">Help portal</a><a href="#" className="hover:text-white transition">Careers</a><a href="#" className="hover:text-white transition">Privacy settings</a></div>
            <div className="flex flex-col gap-5"><a href="#" className="hover:text-white transition">Gift vouchers</a><a href="#" className="hover:text-white transition">Terms of use</a><a href="#" className="hover:text-white transition">Ad choices</a></div>
            <div className="flex flex-col gap-5"><a href="#" className="hover:text-white transition">Press office</a><a href="#" className="hover:text-white transition">Cookie policy</a><a href="#" className="hover:text-white transition">Security hub</a></div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-6">
            <p className="text-[9px] uppercase tracking-[0.3em] font-black">© 2025 TurkStream Global. Engineered for performance.</p>
            <button 
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all text-gray-500 hover:text-red-600"
            >
              <Lock size={12} /> Console Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
