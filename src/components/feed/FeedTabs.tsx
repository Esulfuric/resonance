
import React from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeedTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  forYouContent: React.ReactNode;
  followingContent: React.ReactNode;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({
  activeTab,
  onTabChange,
  onRefresh,
  isLoading,
  forYouContent,
  followingContent,
}) => {
  // Defensive: always provide a non-null content panel
  const safeForYouContent =
    forYouContent !== undefined && forYouContent !== null
      ? forYouContent
      : (
        <div className="text-center py-12 text-muted-foreground">
          Nothing to show.
        </div>
      );

  const safeFollowingContent =
    followingContent !== undefined && followingContent !== null
      ? followingContent
      : (
        <div className="text-center py-12 text-muted-foreground">
          Nothing to show.
        </div>
      );

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      className="mb-6"
      onValueChange={onTabChange}
    >
      <div className="flex items-center justify-between">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="foryou">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full" 
          onClick={onRefresh} 
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <TabsContent value="foryou" className="space-y-4 mt-4">
        {safeForYouContent}
      </TabsContent>
      <TabsContent value="following" className="mt-4">
        {safeFollowingContent}
      </TabsContent>
    </Tabs>
  );
};
