
import { TrendingMusic } from "@/components/TrendingMusic";
import { SuggestedUsers } from "@/components/SuggestedUsers";

interface SidebarProps {
  trendingTopics: {
    id: number;
    name: string;
    postCount: string;
  }[];
}

export const Sidebar = ({ trendingTopics }: SidebarProps) => {
  return (
    <div className="space-y-6">
      {/* What's happening section */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">What's happening</h2>
        </div>
        {trendingTopics.map((topic) => (
          <div key={topic.id} className="p-4 hover:bg-muted transition-colors cursor-pointer border-b last:border-b-0">
            <p className="text-xs text-muted-foreground">Trending in Music</p>
            <p className="font-semibold">{topic.name}</p>
            <p className="text-xs text-muted-foreground">{topic.postCount}</p>
          </div>
        ))}
        <div className="p-4 text-primary hover:bg-muted transition-colors cursor-pointer">
          <p>Show more</p>
        </div>
      </div>
      
      <TrendingMusic />
      <SuggestedUsers />
    </div>
  );
};
