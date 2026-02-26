-- Add user_id to exercises so users can create custom exercises
ALTER TABLE public.exercises ADD COLUMN user_id uuid DEFAULT NULL;

-- RLS policy: authenticated users can insert exercises with their own user_id
CREATE POLICY "Users can create their own exercises"
  ON public.exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS policy: users can update their own custom exercises
CREATE POLICY "Users can update their own exercises"
  ON public.exercises
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policy: users can delete their own custom exercises
CREATE POLICY "Users can delete their own exercises"
  ON public.exercises
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for exercise images
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-images', 'exercise-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload exercise images
CREATE POLICY "Users can upload exercise images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'exercise-images');

-- Allow public read access to exercise images
CREATE POLICY "Anyone can view exercise images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'exercise-images');