
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { MusicSearch } from "@/components/MusicSearch";

const MusicDiscovery = () => {
  const { user } = useAuthGuard();
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="container flex-1 py-6">
        <h1 className="text-2xl font-bold mb-6">Music Discovery</h1>
        <MusicSearch />
      </main>
    </div>
  );
};

export default MusicDiscovery;
