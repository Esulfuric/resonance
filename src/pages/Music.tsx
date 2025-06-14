
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { MusicSearch } from "@/components/MusicSearch";
import { TrendingMusic } from "@/components/TrendingMusic";
import { MusicUpload } from "@/components/MusicUpload";
import { useSupabase } from "@/lib/supabase-provider";
import { useEffect } from "react";

const Music = () => {
  const { user } = useAuthGuard();
  const { user: supabaseUser } = useSupabase();
  
  // Apply orange theme for music page
  useEffect(() => {
    // Set CSS custom properties for orange theme
    const root = document.documentElement;
    root.style.setProperty('--primary', '11 91% 49%'); // orange
    root.style.setProperty('--primary-foreground', '210 40% 98%');
    
    // Add a class to body to indicate music mode
    document.body.classList.add('music-mode');
    
    return () => {
      // Revert to green theme when leaving music page
      root.style.setProperty('--primary', '142.1 70.6% 45.3%'); // green
      root.style.setProperty('--primary-foreground', '210 40% 98%');
      document.body.classList.remove('music-mode');
    };
  }, []);
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  // Check if user is a musician
  const isMusician = supabaseUser?.user_metadata?.user_type === 'musician';

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="container flex-1 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-full bg-resonance-orange animate-pulse"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-resonance-orange to-resonance-orange/60 bg-clip-text text-transparent">
            Music Discovery
          </h1>
        </div>
        
        {isMusician ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MusicUpload />
            </div>
            <div className="space-y-6">
              <TrendingMusic />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MusicSearch />
            </div>
            <div className="space-y-6">
              <TrendingMusic />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Music;
