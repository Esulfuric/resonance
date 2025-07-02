
-- Add RLS policies to allow public access to approved music uploads and tracks

-- Policy for viewing approved music uploads
CREATE POLICY "Anyone can view approved music uploads" 
  ON public.music_uploads 
  FOR SELECT 
  USING (status = 'approved');

-- Policy for viewing tracks of approved uploads
CREATE POLICY "Anyone can view tracks of approved uploads" 
  ON public.music_tracks 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.music_uploads 
    WHERE id = music_tracks.upload_id AND status = 'approved'
  ));

-- Update storage policies to allow public access to approved music files
-- This will require admin approval of uploads before files become accessible
CREATE POLICY "Anyone can view approved music files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'music-files' AND
    EXISTS (
      SELECT 1 FROM public.music_tracks mt
      JOIN public.music_uploads mu ON mt.upload_id = mu.id
      WHERE mt.original_file_url = name AND mu.status = 'approved'
    )
  );
