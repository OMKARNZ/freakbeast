-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add avatar_url column to profiles if not exists (it may already exist from the types)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Update exercises with image URLs (using free exercise illustrations from a CDN)
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop' WHERE name = 'Push-ups';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=200&h=200&fit=crop' WHERE name = 'Pull-ups';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&h=200&fit=crop' WHERE name = 'Squats';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=200&h=200&fit=crop' WHERE name = 'Bench Press';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=200&h=200&fit=crop' WHERE name = 'Deadlift';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=200&h=200&fit=crop' WHERE name = 'Lunges';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=200&h=200&fit=crop' WHERE name = 'Shoulder Press';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop' WHERE name = 'Bicep Curls';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=200&h=200&fit=crop' WHERE name = 'Tricep Dips';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop' WHERE name = 'Plank';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' WHERE name = 'Lat Pulldown';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=200&h=200&fit=crop' WHERE name = 'Leg Press';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=200&h=200&fit=crop' WHERE name = 'Cable Rows';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=200&h=200&fit=crop' WHERE name ILIKE '%running%' OR name ILIKE '%jog%';
UPDATE exercises SET image_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop' WHERE name ILIKE '%stretch%' OR name ILIKE '%yoga%';