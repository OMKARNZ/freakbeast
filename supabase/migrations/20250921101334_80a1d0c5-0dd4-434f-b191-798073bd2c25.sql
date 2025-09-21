-- Fix goal_type enum to include muscle_gain as alias for muscle_building
-- First, let's check what we have and add missing enum value that the frontend expects

-- Add muscle_gain to the goal_type enum
ALTER TYPE goal_type ADD VALUE 'muscle_gain';

-- Add any sample exercises to the exercises table if empty
INSERT INTO exercises (name, exercise_type, muscle_group, description, instructions) VALUES
('Push-ups', 'bodyweight', 'chest', 'Classic bodyweight chest exercise', ARRAY['Start in plank position', 'Lower body to ground', 'Push back up', 'Repeat']),
('Squats', 'bodyweight', 'legs', 'Fundamental leg strengthening exercise', ARRAY['Stand with feet shoulder-width apart', 'Lower into sitting position', 'Keep knees over toes', 'Stand back up']),
('Plank', 'bodyweight', 'core', 'Core stability exercise', ARRAY['Start in push-up position', 'Hold body straight', 'Engage core muscles', 'Breathe normally']),
('Jumping Jacks', 'cardio', 'full_body', 'Full body cardio exercise', ARRAY['Start with feet together', 'Jump while spreading legs', 'Raise arms overhead', 'Return to start position'])
ON CONFLICT (name) DO NOTHING;