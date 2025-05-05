
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { SearchIcon, X } from "lucide-react";
import { MusicTrack } from '@/components/MusicTrack';
import { motion } from "framer-motion";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Demo search results
  const searchResults = [
    { id: 1, title: "Higher Power", artist: "Coldplay", cover: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: 2, title: "Leave The Door Open", artist: "Bruno Mars, Anderson .Paak", cover: "https://randomuser.me/api/portraits/women/44.jpg" },
    { id: 3, title: "Save Your Tears", artist: "The Weeknd", cover: "https://randomuser.me/api/portraits/men/45.jpg" },
    { id: 4, title: "MONTERO", artist: "Lil Nas X", cover: "https://randomuser.me/api/portraits/men/22.jpg" },
    { id: 5, title: "Kiss Me More", artist: "Doja Cat ft. SZA", cover: "https://randomuser.me/api/portraits/women/67.jpg" },
  ].filter(track => 
    searchQuery && (track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="container max-w-4xl mx-auto pb-20">
      <div className="sticky top-16 pt-4 pb-2 bg-background z-10">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for music, artists, or playlists"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-6 text-base"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {searchQuery ? (
          searchResults.length > 0 ? (
            <div className="space-y-2">
              <h2 className="text-lg font-medium mb-4">Search Results</h2>
              {searchResults.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MusicTrack
                    title={track.title}
                    artist={track.artist}
                    cover={track.cover}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          )
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Start typing to search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
