
import React from "react";
import { Button } from "@/components/ui/button";

export const EmptyFollowingState: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <h3 className="text-xl font-medium mb-2">Follow more people to see their posts</h3>
      <p className="text-muted-foreground mb-4">When you follow someone, you'll see their posts here.</p>
      <Button onClick={() => window.location.href = '/search'}>Find people to follow</Button>
    </div>
  );
};
