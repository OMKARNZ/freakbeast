-- Add muscle_gain to the goal_type enum
ALTER TYPE goal_type ADD VALUE 'muscle_gain';

-- Add sample exercises to the exercises table
INSERT INTO exercises (name, exercise_type, muscle_group, description, instructions) VALUES
('Push-ups', 'bodyweight', 'chest', 'Classic bodyweight chest exercise', ARRAY['Start in plank position', 'Lower body to ground', 'Push back up', 'Repeat']),
('Squats', 'bodyweight', 'legs', 'Fundamental leg strengthening exercise', ARRAY['Stand with feet shoulder-width apart', 'Lower into sitting position', 'Keep knees over toes', 'Stand back up']),
('Plank', 'bodyweight', 'core', 'Core stability exercise', ARRAY['Start in push-up position', 'Hold body straight', 'Engage core muscles', 'Breathe normally']),
('Jumping Jacks', 'cardio', 'full_body', 'Full body cardio exercise', ARRAY['Start with feet together', 'Jump while spreading legs', 'Raise arms overhead', 'Return to start position']);

-- Create a verification success page table for tracking verification status
CREATE TABLE IF NOT EXISTS public.user_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_type TEXT NOT NULL DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own verifications" 
ON public.user_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications" 
ON public.user_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);