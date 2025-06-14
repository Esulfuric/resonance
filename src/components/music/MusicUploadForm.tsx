
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/lib/supabase-provider";
import { TrackInput } from "./TrackInput";
import { UploadFormFields } from "./UploadFormFields";
import { SubmitButton } from "./SubmitButton";

interface Track {
  id: string;
  title: string;
  file: File | null;
}

export function MusicUploadForm() {
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

  const handleFileUpload = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from(path.startsWith('cover-art') ? 'cover-art' : 'music-files')
      .upload(path, file);
    
    if (error) throw error;
    return data.path;
  };

  const convertToAAC = async (filePath: string) => {
    return filePath.replace('.mp3', '.m4a');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);
    
    try {
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

      let coverArtUrl = null;
      if (formData.coverArt) {
        const coverArtPath = `${user.id}/${Date.now()}-cover.${formData.coverArt.name.split('.').pop()}`;
        await handleFileUpload(formData.coverArt, coverArtPath);
        coverArtUrl = `https://sieepgujumwjauyoahzp.supabase.co/storage/v1/object/public/cover-art/${coverArtPath}`;
      }

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

      for (let i = 0; i < validTracks.length; i++) {
        const track = validTracks[i];
        if (!track.file) continue;

        const originalPath = `${user.id}/${uploadData.id}/${Date.now()}-${track.file.name}`;
        const uploadedPath = await handleFileUpload(track.file, originalPath);
        const convertedPath = await convertToAAC(uploadedPath);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <UploadFormFields
        uploadType={uploadType}
        setUploadType={setUploadType}
        formData={formData}
        setFormData={setFormData}
      />
      
      <TrackInput
        tracks={tracks}
        setTracks={setTracks}
        uploadType={uploadType}
      />

      <SubmitButton isUploading={isUploading} />
    </form>
  );
}
