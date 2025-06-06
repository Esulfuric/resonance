
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { MusicSearch } from "@/components/MusicSearch";
import { TrendingMusic } from "@/components/TrendingMusic";
import { MobileCharts } from "@/components/MobileCharts";
import { useEffect } from "react";

const Music = () => {
  const { user } = useAuthGuard();
  
  // Apply music theme when component mounts
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', '25 93% 47%'); // #ed2f0a
    document.documentElement.style.setProperty('--primary-foreground', '210 40% 98%');
    
    return () => {
      // Revert to original theme when component unmounts
      document.documentElement.style.setProperty('--primary', '142.1 70.6% 45.3%');
      document.documentElement.style.setProperty('--primary-foreground', '210 40% 98%');
    };
  }, []);
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 animate-fade-in">
      <main className="container flex-1 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-full bg-primary animate-pulse"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Music Discovery
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MusicSearch />
          </div>
          <div className="space-y-6">
            <TrendingMusic />
            <MobileCharts />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Music;
