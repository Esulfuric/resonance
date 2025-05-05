
import React from 'react';
import { Play } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface MusicTrackProps {
  title: string;
  artist: string;
  cover: string;
}

export const MusicTrack: React.FC<MusicTrackProps> = ({ title, artist, cover }) => {
  return (
    <motion.div 
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 rounded-md">
          <AvatarImage src={cover} alt={`${title} by ${artist}`} />
          <AvatarFallback className="rounded-md">{title[0]}{artist[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">{artist}</span>
        </div>
      </div>
      <Button size="icon" variant="ghost" className="rounded-full h-9 w-9">
        <Play className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};
