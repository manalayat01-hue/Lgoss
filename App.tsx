
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Content, User, Episode } from './types';
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
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [contentList, setContentList] = useState<Content[]>(mockContent);
  const [user, setUser] = useState<User>({
    id: 'user-1',
    name: 'Mustafa',
    email: 'mustafa@example.com',
    profilePic: 'https://picsum.photos/seed/profile/100/100',
    watchlist: [],
    history: ['1', '4'],
    role: 'admin' // Initialized as admin for demo purposes
  });
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [playingContent, setPlayingContent] = useState<Content | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [recommendations, setRecommendations] = useState<Content[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filtered Content
  const movies = useMemo(() => contentList.filter(c => c.type === 'movie'), [contentList]);
  const series = useMemo(() => contentList.filter(c => c.type === 'series'), [contentList]);
  const popular = useMemo(() => contentList.filter(c => c.isPopular), [contentList]);
  const newReleases = useMemo(() => contentList.filter(c => c.isNew), [contentList]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return contentList.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, contentList]);

  // Effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchRecs = async () => {
      if (user.history.length > 0) {
        setIsAiLoading(true);
        const recIds = await getPersonalizedRecommendations(user.history, contentList);
        const recs = contentList.filter(c => recIds.includes(c.id));
        setRecommendations(recs);
        setIsAiLoading(false);
      }
    };
    fetchRecs();
  }, [user.history, contentList]);

  // Handlers
  const toggleWatchlist = (id: string) => {
    setUser(prev => {
      const exists = prev.watchlist.includes(id);
      return {
        ...prev,
        watchlist: exists ? prev.watchlist.filter(wId => wId !== id) : [...prev.watchlist, id]
      };
    });
  };

  const handlePlay = (content: Content, episode?: Episode) => {
    setPlayingContent(content);
    setPlayingEpisode(episode || (content.type === 'series' && content.episodes ? content.episodes[0] : null));
    setActiveContent(null);
    // Add to history
    if (!user.history.includes(content.id)) {
      setUser(prev => ({ ...prev, history: [content.id, ...prev.history] }));
    }
  };

  const FeaturedHero = () => {
    const featured = contentList[0];
    return (
      <div className="relative h-[60vh] md:h-[85vh] w-full">
        <img 
          src={featured.backdrop} 
          alt={featured.title}
          className="w-full h-full object-cover brightness-[0.7]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-12 md:bottom-24 left-4 md:left-12 max-w-2xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{featured.title}</h1>
          <p className="text-sm md:text-lg mb-6 line-clamp-3 md:line-clamp-none text-gray-200">{featured.description}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => handlePlay(featured)}
              className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-300 transition"
            >
              <Play fill="black" /> Play
            </button>
            <button 
              onClick={() => setActiveContent(featured)}
              className="flex items-center gap-2 bg-gray-500/50 text-white px-6 py-2 rounded font-bold hover:bg-gray-500/80 transition"
            >
              <Info /> More Info
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 flex items-center justify-between px-4 md:px-12 py-4 ${isScrolled ? 'bg-black' : 'bg-transparent bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="flex items-center gap-4 md:gap-12">
          <h1 className="text-2xl md:text-3xl font-bold text-red-600 tracking-tighter cursor-pointer" onClick={() => window.scrollTo(0, 0)}>TURKSTREAM</h1>
          <div className="hidden md:flex gap-4 text-sm font-medium">
            <a href="#" className="hover:text-gray-300">Home</a>
            <a href="#" className="hover:text-gray-300">Series</a>
            <a href="#" className="hover:text-gray-300">Movies</a>
            <a href="#" className="hover:text-gray-300">New & Popular</a>
            <a href="#" className="hover:text-gray-300">My List</a>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Titles, people, genres"
              className="bg-black/50 border border-gray-600 pl-10 pr-4 py-1.5 rounded-full text-sm focus:outline-none focus:border-white transition-all w-32 md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Bell className="w-6 h-6 cursor-pointer hover:text-gray-300 hidden md:block" />
          
          <div className="relative group">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={user.profilePic} className="w-8 h-8 rounded" alt="profile" />
              <ChevronDown className="w-4 h-4" />
            </div>
            
            <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-800 rounded shadow-xl hidden group-hover:block overflow-hidden transition-all">
              <div className="p-3 border-b border-gray-800 flex items-center gap-3">
                <img src={user.profilePic} className="w-6 h-6 rounded" alt="" />
                <span className="text-sm font-semibold">{user.name}</span>
              </div>
              <button className="w-full text-left px-4 py-3 text-xs hover:bg-gray-900 flex items-center gap-2">
                <UserIcon size={14} /> Account
              </button>
              {user.role === 'admin' && (
                <button 
                  onClick={() => setShowAdmin(true)}
                  className="w-full text-left px-4 py-3 text-xs hover:bg-gray-900 flex items-center gap-2 text-red-500 font-bold"
                >
                  <ShieldCheck size={14} /> Admin Panel
                </button>
              )}
              <button className="w-full text-left px-4 py-3 text-xs hover:bg-gray-900 flex items-center gap-2">
                <LogOut size={14} /> Sign out of TurkStream
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main UI */}
      {!searchQuery ? (
        <>
          <FeaturedHero />
          <div className="-mt-12 md:-mt-32 relative z-20 pb-20">
            {recommendations.length > 0 && (
              <ContentRow 
                title="AI Recommendations Just For You" 
                items={recommendations} 
                onMoreInfo={setActiveContent} 
                onPlay={handlePlay}
                watchlist={user.watchlist}
                onToggleWatchlist={toggleWatchlist}
              />
            )}
            <ContentRow 
              title="Trending Now" 
              items={popular} 
              onMoreInfo={setActiveContent} 
              onPlay={handlePlay}
              watchlist={user.watchlist}
              onToggleWatchlist={toggleWatchlist}
            />
            <ContentRow 
              title="New Releases" 
              items={newReleases} 
              onMoreInfo={setActiveContent} 
              onPlay={handlePlay}
              watchlist={user.watchlist}
              onToggleWatchlist={toggleWatchlist}
            />
            <ContentRow 
              title="Action Packed Series" 
              items={series.filter(s => s.genres.includes('Action'))} 
              onMoreInfo={setActiveContent} 
              onPlay={handlePlay}
              watchlist={user.watchlist}
              onToggleWatchlist={toggleWatchlist}
            />
            <ContentRow 
              title="Heartfelt Movies" 
              items={movies} 
              onMoreInfo={setActiveContent} 
              onPlay={handlePlay}
              watchlist={user.watchlist}
              onToggleWatchlist={toggleWatchlist}
            />
            <ContentRow 
              title="My List" 
              items={contentList.filter(c => user.watchlist.includes(c.id))} 
              onMoreInfo={setActiveContent} 
              onPlay={handlePlay}
              watchlist={user.watchlist}
              onToggleWatchlist={toggleWatchlist}
            />
          </div>
        </>
      ) : (
        <div className="pt-24 px-4 md:px-12">
          <h2 className="text-2xl font-semibold mb-6">Search results for "{searchQuery}"</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map(item => (
              <div key={item.id} className="cursor-pointer group" onClick={() => setActiveContent(item)}>
                <img src={item.thumbnail} className="w-full h-[300px] object-cover rounded-md group-hover:scale-105 transition duration-300" alt="" />
                <p className="mt-2 text-sm font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Detail Modal */}
      {activeContent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#181818] w-full max-w-4xl rounded-xl overflow-hidden relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setActiveContent(null)}
              className="absolute top-4 right-4 z-[70] p-2 bg-black/60 rounded-full hover:bg-black/80 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative h-[400px]">
              <img src={activeContent.backdrop} className="w-full h-full object-cover brightness-75" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">{activeContent.title}</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handlePlay(activeContent)}
                    className="bg-white text-black px-8 py-2.5 rounded font-bold flex items-center gap-2 hover:bg-gray-300 transition"
                  >
                    <Play fill="black" size={20} /> Play
                  </button>
                  <button 
                    onClick={() => toggleWatchlist(activeContent.id)}
                    className="p-2.5 rounded-full border border-gray-500 hover:border-white transition flex items-center justify-center"
                  >
                    {user.watchlist.includes(activeContent.id) ? <Check /> : <Plus />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 text-green-400 font-bold mb-4">
                  <span>{Math.round(activeContent.rating * 20)}% Match</span>
                  <span className="text-gray-400 font-normal">{activeContent.year}</span>
                  <span className="text-xs border border-gray-600 px-1 rounded text-gray-400">HD</span>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">{activeContent.description}</p>
                
                {activeContent.type === 'series' && activeContent.episodes && (
                  <div className="mt-12">
                    <h3 className="text-2xl font-bold mb-6 flex justify-between items-center">
                      Episodes
                      <span className="text-sm font-normal text-gray-400">Season 1</span>
                    </h3>
                    <div className="space-y-4">
                      {activeContent.episodes.map((ep, i) => (
                        <div 
                          key={ep.id} 
                          className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800/50 group cursor-pointer border border-transparent hover:border-gray-700 transition"
                          onClick={() => handlePlay(activeContent, ep)}
                        >
                          <span className="text-2xl font-bold text-gray-500 min-w-[30px]">{i + 1}</span>
                          <div className="relative w-40 h-24 flex-shrink-0">
                            <img src={ep.thumbnail} className="w-full h-full object-cover rounded" alt="" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <Play className="w-8 h-8 text-white fill-current" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-bold text-lg">{ep.title}</h4>
                              <span className="text-gray-400 text-sm">{ep.duration}</span>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">{ep.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-gray-500 text-sm mb-1 font-semibold uppercase tracking-wider">Cast</h4>
                  <p className="text-sm text-gray-300">Cagatay Ulusoy, Ayça Ayşin Turan, Hazar Ergüçlü</p>
                </div>
                <div>
                  <h4 className="text-gray-500 text-sm mb-1 font-semibold uppercase tracking-wider">Genres</h4>
                  <p className="text-sm text-gray-300">{activeContent.genres.join(', ')}</p>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                  <h4 className="font-bold mb-4 flex items-center gap-2"><ThumbsUp size={18} /> User Ratings</h4>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl font-bold">{activeContent.rating}</span>
                    <div className="flex flex-col">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <div key={s} className={`w-3 h-3 rounded-full ${s <= Math.floor(activeContent.rating) ? 'bg-red-600' : 'bg-gray-600'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">Based on 1.2k reviews</span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition flex items-center justify-center gap-2">
                    <MessageCircle size={16} /> Write a Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Overlay */}
      {playingContent && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-[110]">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPlayingContent(null)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={32} />
              </button>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-medium">Watching</span>
                <h3 className="text-xl font-bold">
                  {playingContent.title} {playingEpisode && ` - S1:E${playingEpisode.episodeNumber} ${playingEpisode.title}`}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="w-full h-full">
            {/* Using an iframe to simulate a video player with DailyMotion or YouTube */}
            <iframe 
              src={playingEpisode?.videoUrl || playingContent.trailerUrl} 
              className="w-full h-full border-none"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>

          <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-12 text-sm text-gray-400 pointer-events-none">
            <span className="flex items-center gap-2"><Check size={16} /> Auto-play Next</span>
            <span className="flex items-center gap-2"><Check size={16} /> 1080p Ultra HD</span>
            <span className="flex items-center gap-2"><Check size={16} /> Turkish Subtitles</span>
          </div>
        </div>
      )}

      {/* Admin Panel Overlay */}
      {showAdmin && (
        <AdminPanel 
          content={contentList} 
          users={[]} // Simplified for demo
          onClose={() => setShowAdmin(false)}
          onUpdateContent={setContentList}
        />
      )}

      {/* Footer */}
      <footer className="bg-black pt-20 pb-12 px-4 md:px-12 border-t border-gray-900 text-gray-500">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-6 mb-8 text-white">
            <span className="hover:text-red-600 transition cursor-pointer">Facebook</span>
            <span className="hover:text-red-600 transition cursor-pointer">Instagram</span>
            <span className="hover:text-red-600 transition cursor-pointer">Twitter</span>
            <span className="hover:text-red-600 transition cursor-pointer">YouTube</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs mb-12">
            <div className="flex flex-col gap-4">
              <a href="#" className="hover:underline">Audio Description</a>
              <a href="#" className="hover:underline">Investor Relations</a>
              <a href="#" className="hover:underline">Legal Notices</a>
            </div>
            <div className="flex flex-col gap-4">
              <a href="#" className="hover:underline">Help Center</a>
              <a href="#" className="hover:underline">Jobs</a>
              <a href="#" className="hover:underline">Cookie Preferences</a>
            </div>
            <div className="flex flex-col gap-4">
              <a href="#" className="hover:underline">Gift Cards</a>
              <a href="#" className="hover:underline">Terms of Use</a>
              <a href="#" className="hover:underline">Corporate Information</a>
            </div>
            <div className="flex flex-col gap-4">
              <a href="#" className="hover:underline">Media Center</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Contact Us</a>
            </div>
          </div>
          <p className="text-[10px] md:text-xs">© 2024 TurkStream Streaming Service. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
