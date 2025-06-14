
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Music, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/lib/supabase-provider";

interface Track {
  id: string;
  title: string;
  file: File | null;
}

export function MusicUpload() {
  const { toast } = useToast();
  const { user } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'single' | 'album'>('single');
  const [formData, setFormData] = useState({
    title: '',
    albumName: '',
    composerFullName: '',
    coverArt: null as File | null,
  });
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', title: '', file: null }
  ]);

  const addTrack = () => {
    if (tracks.length < 20) {
      setTracks([...tracks, { id: Date.now().toString(), title: '', file: null }]);
    }
  };

  const removeTrack = (id: string) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter(track => track.id !== id));
    }
  };

  const updateTrack = (id: string, field: 'title' | 'file', value: string | File) => {
    setTracks(tracks.map(track => 
      track.id === id ? { ...track, [field]: value } : track
    ));
  };

  const handleFileUpload = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from(path.startsWith('cover-art') ? 'cover-art' : 'music-files')
      .upload(path, file);
    
    if (error) throw error;
    return data.path;
  };

  const convertToAAC = async (filePath: string) => {
    // For now, we'll just return the original path
    // In a real implementation, you'd use an edge function to convert the file
    return filePath.replace('.mp3', '.m4a');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);
    
    try {
      // Validate form
      if (!formData.title || !formData.composerFullName) {
        throw new Error('Please fill in all required fields');
      }
      
      if (uploadType === 'album' && !formData.albumName) {
        throw new Error('Album name is required for album uploads');
      }
      
      const validTracks = tracks.filter(track => track.title && track.file);
      if (validTracks.length === 0) {
        throw new Error('Please add at least one track');
      }

      // Upload cover art if provided
      let coverArtUrl = null;
      if (formData.coverArt) {
        const coverArtPath = `${user.id}/${Date.now()}-cover.${formData.coverArt.name.split('.').pop()}`;
        await handleFileUpload(formData.coverArt, coverArtPath);
        coverArtUrl = `${supabase.storageUrl}/object/public/cover-art/${coverArtPath}`;
      }

      // Create music upload record
      const { data: uploadData, error: uploadError } = await supabase
        .from('music_uploads')
        .insert({
          artist_id: user.id,
          upload_type: uploadType,
          title: formData.title,
          album_name: uploadType === 'album' ? formData.albumName : null,
          composer_full_name: formData.composerFullName,
          cover_art_url: coverArtUrl,
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      // Upload tracks
      for (let i = 0; i < validTracks.length; i++) {
        const track = validTracks[i];
        if (!track.file) continue;

        // Upload original file
        const originalPath = `${user.id}/${uploadData.id}/${Date.now()}-${track.file.name}`;
        const uploadedPath = await handleFileUpload(track.file, originalPath);
        
        // Convert to AAC (placeholder for now)
        const convertedPath = await convertToAAC(uploadedPath);

        // Create track record
        const { error: trackError } = await supabase
          .from('music_tracks')
          .insert({
            upload_id: uploadData.id,
            track_number: uploadType === 'album' ? i + 1 : null,
            track_title: track.title,
            original_file_url: uploadedPath,
            converted_file_url: convertedPath,
          });

        if (trackError) throw trackError;
      }

      toast({
        title: "Upload Successful!",
        description: "Your music has been submitted for admin review.",
      });

      // Reset form
      setFormData({
        title: '',
        albumName: '',
        composerFullName: '',
        coverArt: null,
      });
      setTracks([{ id: '1', title: '', file: null }]);
      setUploadType('single');

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-resonance-orange" />
          Upload Music
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Type */}
          <div className="space-y-2">
            <Label htmlFor="uploadType">Upload Type</Label>
            <Select value={uploadType} onValueChange={(value: 'single' | 'album') => setUploadType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select upload type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="album">Album</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {uploadType === 'album' ? 'Album Title' : 'Song Title'} *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={uploadType === 'album' ? 'Enter album title' : 'Enter song title'}
              required
            />
          </div>

          {/* Album Name (only for albums) */}
          {uploadType === 'album' && (
            <div className="space-y-2">
              <Label htmlFor="albumName">Album Name *</Label>
              <Input
                id="albumName"
                value={formData.albumName}
                onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
                placeholder="Enter album name"
                required
              />
            </div>
          )}

          {/* Composer Full Name */}
          <div className="space-y-2">
            <Label htmlFor="composerFullName">Composer Full Name *</Label>
            <Input
              id="composerFullName"
              value={formData.composerFullName}
              onChange={(e) => setFormData({ ...formData, composerFullName: e.target.value })}
              placeholder="Enter composer's full name"
              required
            />
          </div>

          {/* Cover Art */}
          <div className="space-y-2">
            <Label htmlFor="coverArt">
              {uploadType === 'album' ? 'Album' : 'Song'} Cover Art
            </Label>
            <Input
              id="coverArt"
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, coverArt: e.target.files?.[0] || null })}
            />
          </div>

          {/* Tracks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tracks</Label>
              {uploadType === 'album' && tracks.length < 20 && (
                <Button type="button" variant="outline" size="sm" onClick={addTrack}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Track
                </Button>
              )}
            </div>

            {tracks.map((track, index) => (
              <div key={track.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>Track {index + 1}</Label>
                  {tracks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrack(track.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <Input
                  placeholder="Track title"
                  value={track.title}
                  onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                />
                
                <Input
                  type="file"
                  accept=".mp3"
                  onChange={(e) => updateTrack(track.id, 'file', e.target.files?.[0] || null)}
                />
              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            disabled={isUploading}
            className="w-full bg-resonance-orange hover:bg-resonance-orange/90"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
