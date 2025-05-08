
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Music, Image, Smile, ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [attachedSong, setAttachedSong] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMusicDialogOpen, setIsMusicDialogOpen] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      let uploadedImageUrl = null;
      
      // Upload image if attached
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `posts/${fileName}`;
        
        // Check if the storage bucket exists and create it if it doesn't
        const { data: buckets } = await supabase.storage.listBuckets();
        const postsBucket = buckets?.find(b => b.name === 'posts');
        
        if (!postsBucket) {
          await supabase.storage.createBucket('posts', { public: true });
        }
        
        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('posts')
          .upload(filePath, imageFile);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase
          .storage
          .from('posts')
          .getPublicUrl(filePath);
          
        uploadedImageUrl = urlData.publicUrl;
      }
      
      // Create post in Supabase
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          song_title: attachedSong,
          image_url: uploadedImageUrl
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
    setIsMusicDialogOpen(true);
  };

  const saveSongDetails = () => {
    if (songTitle.trim()) {
      const songInfo = songArtist ? `${songTitle} by ${songArtist}` : songTitle;
      setAttachedSong(songInfo);
      setIsMusicDialogOpen(false);
    }
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
                  
                  {/* Display attached song */}
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
                  
                  {/* Display attached image */}
                  {attachedImage && (
                    <div className="mb-3 relative">
                      <img 
                        src={attachedImage} 
                        alt="Attached" 
                        className="rounded-md max-h-64 w-auto object-contain"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          setAttachedImage(null);
                          setImageFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
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
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image className="h-4 w-4" />
                      <span className="sr-only">Attach image</span>
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden"
                    />
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
      
      {/* Music selection dialog */}
      <Dialog open={isMusicDialogOpen} onOpenChange={setIsMusicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Music to your Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Song Title</label>
              <Input
                placeholder="Enter song title"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Artist (optional)</label>
              <Input
                placeholder="Enter artist name"
                value={songArtist}
                onChange={(e) => setSongArtist(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsMusicDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveSongDetails}>Add Music</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePost;
