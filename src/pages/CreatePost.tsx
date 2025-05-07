
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Music, Image, Smile, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { supabase } from "@/lib/supabase";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [attachedSong, setAttachedSong] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create post in Supabase
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          song_title: attachedSong || null
        });
      
      if (error) throw error;
      
      toast({
        title: "Post created!",
        description: "Your post has been published.",
      });
      
      // Navigate back to feed
      navigate('/feed');
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message || "There was a problem creating your post.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleAttachSong = () => {
    // Mock attaching a song - in a real app this would open a music selection modal
    setAttachedSong("Ocean Waves by Chill Vibes");
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <div className="container flex items-center h-16">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Create Post</h1>
          <Button 
            onClick={handleSubmit}
            className="ml-auto bg-resonance-green hover:bg-resonance-green/90"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
      
      <div className="container pt-24 pb-4">
        <Card className="border-0 shadow-none">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 avatar-ring">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                  <AvatarFallback>{user?.email?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share what's resonating with you..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[150px] resize-none border-none p-0 focus-visible:ring-0"
                    autoFocus
                  />
                  
                  {attachedSong && (
                    <div className="mb-3 flex items-center gap-2 rounded-md bg-secondary p-2 text-sm">
                      <Music className="h-4 w-4 text-resonance-green" />
                      <span className="flex-1">{attachedSong}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => setAttachedSong(null)}
                      >
                        <span className="sr-only">Remove</span>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={handleAttachSong}
                    >
                      <Music className="h-4 w-4 text-resonance-green" />
                      <span className="sr-only">Attach music</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <Image className="h-4 w-4" />
                      <span className="sr-only">Attach image</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <Smile className="h-4 w-4" />
                      <span className="sr-only">Add emoji</span>
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;
