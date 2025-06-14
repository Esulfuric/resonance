
-- Create table for music uploads
CREATE TABLE public.music_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES auth.users NOT NULL,
  upload_type TEXT NOT NULL CHECK (upload_type IN ('single', 'album')),
  title TEXT NOT NULL,
  album_name TEXT,
  composer_full_name TEXT NOT NULL,
  cover_art_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual tracks (for both singles and album tracks)
CREATE TABLE public.music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID REFERENCES public.music_uploads(id) ON DELETE CASCADE NOT NULL,
  track_number INTEGER,
  track_title TEXT NOT NULL,
  original_file_url TEXT NOT NULL,
  converted_file_url TEXT,
  duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.music_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Policies for music_uploads
CREATE POLICY "Artists can view their own uploads" 
  ON public.music_uploads 
  FOR SELECT 
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can create uploads" 
  ON public.music_uploads 
  FOR INSERT 
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their pending uploads" 
  ON public.music_uploads 
  FOR UPDATE 
  USING (auth.uid() = artist_id AND status = 'pending');

-- Policies for music_tracks
CREATE POLICY "Artists can view their own tracks" 
  ON public.music_tracks 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.music_uploads 
    WHERE id = upload_id AND artist_id = auth.uid()
  ));

CREATE POLICY "Artists can create tracks for their uploads" 
  ON public.music_tracks 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.music_uploads 
    WHERE id = upload_id AND artist_id = auth.uid()
  ));

-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public) VALUES ('music-files', 'music-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('cover-art', 'cover-art', true);

-- Storage policies for music files (private)
CREATE POLICY "Artists can upload music files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'music-files' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Artists can view their own music files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'music-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for cover art (public)
CREATE POLICY "Anyone can view cover art" ON storage.objects
  FOR SELECT USING (bucket_id = 'cover-art');

CREATE POLICY "Artists can upload cover art" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cover-art' AND 
    auth.role() = 'authenticated'
  );
