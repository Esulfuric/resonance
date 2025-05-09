
import { TrendingMusic } from "@/components/TrendingMusic";
import { SuggestedUsers } from "@/components/SuggestedUsers";

export const Sidebar = () => {
  return (
    <div className="space-y-6">
      <TrendingMusic />
      <SuggestedUsers />
    </div>
  );
};
