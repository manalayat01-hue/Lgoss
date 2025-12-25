
import React, { useRef } from 'react';
import { Content } from '../types';
import ContentCard from './ContentCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContentRowProps {
  title: string;
  items: Content[];
  onMoreInfo: (content: Content) => void;
  onPlay: (content: Content) => void;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
}

const ContentRow: React.FC<ContentRowProps> = ({ 
  title, 
  items, 
  onMoreInfo, 
  onPlay, 
  watchlist, 
  onToggleWatchlist 
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-8 md:mb-12 relative group px-4 md:px-12">
      <h2 className="text-white text-lg md:text-2xl font-semibold mb-4">{title}</h2>
      
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-[50%] z-40 h-[100%] w-12 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-50%] hover:bg-black/60"
      >
        <ChevronLeft className="text-white w-8 h-8" />
      </button>

      <div 
        ref={rowRef}
        className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth p-2"
      >
        {items.map((item) => (
          <ContentCard 
            key={item.id} 
            content={item} 
            onMoreInfo={onMoreInfo}
            onPlay={onPlay}
            isWatchlisted={watchlist.includes(item.id)}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-[50%] z-40 h-[100%] w-12 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-50%] hover:bg-black/60"
      >
        <ChevronRight className="text-white w-8 h-8" />
      </button>
    </div>
  );
};

export default ContentRow;
