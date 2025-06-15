
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAllPostsForModeration, removePost } from "@/services/adminService";
import { Trash2, User, Calendar, Image } from "lucide-react";

interface AdminPostModerationProps {
  adminId: string;
}

export const AdminPostModeration = ({ adminId }: AdminPostModerationProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getAllPostsForModeration();
      setPosts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePost = async (postId: string) => {
    const reason = prompt("Please provide a reason for removing this post:");
    if (!reason) return;

    setActionLoading(postId);
    try {
      const result = await removePost(postId, adminId, reason);
      if (result.success) {
        toast({
          title: "Post Removed",
          description: "The post has been removed for policy violation",
        });
        await fetchPosts();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove post",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while removing the post",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {posts.map((post) => (
        <Card key={post.id} className={post.is_removed ? "border-l-4 border-l-red-500 opacity-60" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.profiles?.full_name || post.profiles?.username || "Unknown User"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {post.is_removed ? (
                  <Badge variant="destructive">Removed</Badge>
                ) : (
                  <Button
                    onClick={() => handleRemovePost(post.id)}
                    disabled={actionLoading === post.id}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {actionLoading === post.id ? "Removing..." : "Remove"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {post.is_removed ? (
              <div className="text-red-600 font-medium">
                This post has been removed because it doesn't follow the content policies
                <p className="text-sm text-gray-600 mt-1">Reason: {post.removal_reason}</p>
              </div>
            ) : (
              <>
                <p className="text-gray-800">{post.content}</p>
                
                {post.song_title && (
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm font-medium">♪ {post.song_title}</p>
                  </div>
                )}
                
                {post.image_url && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Image className="h-3 w-3" />
                    <span>Contains image</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
