
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Music, Image, Smile, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [attachedSong, setAttachedSong] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // In a real app, we would send this data to the server
    toast({
      title: "Post created!",
      description: "Your post has been published.",
    });
    
    // Reset the form
    setContent("");
    setAttachedSong(null);
    setIsFocused(false);
  };

  const handleAttachSong = () => {
    // Mock attaching a song
    setAttachedSong("Ocean Waves by Chill Vibes");
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 avatar-ring">
              <AvatarImage src="https://randomuser.me/api/portraits/women/42.jpg" alt="Profile" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share what's resonating with you..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`min-h-24 resize-none border-none p-0 focus-visible:ring-0 ${
                  isFocused ? "placeholder:text-transparent" : ""
                }`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => !content && setIsFocused(false)}
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
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              )}
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
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
                
                <Button
                  type="submit"
                  size="sm"
                  className="bg-resonance-green hover:bg-resonance-green/90"
                  disabled={!content.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
