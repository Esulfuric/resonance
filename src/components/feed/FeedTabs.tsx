
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
  return (
    <Tabs defaultValue={activeTab} className="mb-6" onValueChange={onTabChange}>
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
        {forYouContent}
      </TabsContent>
      
      <TabsContent value="following" className="mt-4">
        {followingContent}
      </TabsContent>
    </Tabs>
  );
};
