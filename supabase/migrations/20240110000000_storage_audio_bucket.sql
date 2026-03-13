-- =============================================================================
-- Create the 'audio' storage bucket for TTS word audio files
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  true,           -- public: audio files are served directly to children during practice
  5242880,        -- 5 MB max per file
  ARRAY['audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO NOTHING;

-- Allow the service role (used by generate-content API route) to upload
CREATE POLICY "service role can upload audio"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'audio');

-- Allow the service role to update/upsert existing audio files
CREATE POLICY "service role can update audio"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'audio');

-- Allow anyone to read public audio files (children play them during practice)
CREATE POLICY "public can read audio"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'audio');
