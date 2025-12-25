
import React, { useState } from 'react';
import { Content } from '../types';
import { Play, Plus, ChevronDown, Check } from 'lucide-react';

interface ContentCardProps {
  content: Content;
  onMoreInfo: (content: Content) => void;
  onPlay: (content: Content) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (id: string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  onMoreInfo, 
  onPlay, 
  isWatchlisted,
  onToggleWatchlist 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex-shrink-0 w-[200px] h-[300px] md:w-[240px] md:h-[360px] lg:w-[280px] lg:h-[420px] transition-all duration-300 ease-in-out cursor-pointer group rounded-md overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onMoreInfo(content)}
    >
      <img 
        src={content.thumbnail} 
        alt={content.title}
        className="w-full h-full object-cover rounded-md group-hover:opacity-0 transition-opacity"
      />

      {isHovered && (
        <div className="absolute top-0 left-0 w-full h-full bg-[#141414] shadow-2xl z-10 flex flex-col scale-110 origin-center transition-transform duration-300 rounded-md">
          <img 
            src={content.thumbnail} 
            alt={content.title}
            className="w-full h-[60%] object-cover"
          />
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onPlay(content); }}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-300 text-black transition"
              >
                <Play className="fill-current w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleWatchlist(content.id); }}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white text-white transition"
              >
                {isWatchlisted ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onMoreInfo(content); }}
                className="ml-auto w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white text-white transition"
              >
                <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm md:text-base line-clamp-1">{content.title}</span>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-green-400 font-semibold mt-1">
                <span>{Math.round(content.rating * 20)}% Match</span>
                <span className="text-gray-400 border border-gray-600 px-1 rounded">{content.year}</span>
                <span className="text-gray-400 uppercase">{content.type}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {content.genres.slice(0, 3).map(g => (
                  <span key={g} className="text-[9px] md:text-[10px] text-gray-300">• {g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCard;
