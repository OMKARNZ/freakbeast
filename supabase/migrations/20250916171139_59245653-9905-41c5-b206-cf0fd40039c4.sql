-- Create enum types for better data integrity
CREATE TYPE public.goal_type AS ENUM ('weight_loss', 'weight_gain', 'muscle_building', 'strength', 'endurance', 'general_fitness');
CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
CREATE TYPE public.exercise_type AS ENUM ('weights', 'bodyweight', 'cardio', 'flexibility', 'other');
CREATE TYPE public.muscle_group AS ENUM ('chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'full_body', 'cardio');
CREATE TYPE public.workout_status AS ENUM ('planned', 'in_progress', 'completed', 'skipped');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  gender TEXT,
  activity_level TEXT,
  bmi DECIMAL(4,1) GENERATED ALWAYS AS (
    CASE 
      WHEN height_cm > 0 AND weight_kg > 0 
      THEN ROUND((weight_kg / POWER(height_cm / 100.0, 2))::numeric, 1)
      ELSE NULL 
    END
  ) STORED,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fitness goals table
CREATE TABLE public.fitness_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type goal_type NOT NULL,
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT,
  target_date DATE,
  status goal_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises catalog table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group muscle_group NOT NULL,
  exercise_type exercise_type NOT NULL,
  equipment TEXT,
  instructions TEXT[],
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout routines table (weekly plans)
CREATE TABLE public.workout_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily routines table (specific day workouts within a routine)
CREATE TABLE public.daily_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.workout_routines(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  name TEXT NOT NULL,
  description TEXT,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(routine_id, day_of_week)
);

-- Create routine exercises table (exercises assigned to daily routines)
CREATE TABLE public.routine_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_routine_id UUID NOT NULL REFERENCES public.daily_routines(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 1,
  reps INTEGER,
  weight_kg DECIMAL(6,2),
  duration_seconds INTEGER,
  distance_meters DECIMAL(8,2),
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workouts table (actual workout sessions)
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_routine_id UUID REFERENCES public.daily_routines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status workout_status NOT NULL DEFAULT 'planned',
  scheduled_date DATE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout exercises table (exercises performed in actual workouts)
CREATE TABLE public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets_completed INTEGER NOT NULL DEFAULT 0,
  target_sets INTEGER,
  target_reps INTEGER,
  target_weight_kg DECIMAL(6,2),
  target_duration_seconds INTEGER,
  target_distance_meters DECIMAL(8,2),
  actual_reps INTEGER[],
  actual_weight_kg DECIMAL(6,2)[],
  actual_duration_seconds INTEGER,
  actual_distance_meters DECIMAL(8,2),
  rest_seconds INTEGER,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for fitness goals
CREATE POLICY "Users can view their own goals" ON public.fitness_goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON public.fitness_goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.fitness_goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.fitness_goals
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for exercises (public read access)
CREATE POLICY "Everyone can view exercises" ON public.exercises
FOR SELECT USING (true);

-- Create RLS policies for workout routines
CREATE POLICY "Users can view their own routines" ON public.workout_routines
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routines" ON public.workout_routines
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routines" ON public.workout_routines
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routines" ON public.workout_routines
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for daily routines
CREATE POLICY "Users can view their own daily routines" ON public.daily_routines
FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.workout_routines WHERE id = routine_id));

CREATE POLICY "Users can create daily routines in their own workout routines" ON public.daily_routines
FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.workout_routines WHERE id = routine_id));

CREATE POLICY "Users can update their own daily routines" ON public.daily_routines
FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.workout_routines WHERE id = routine_id));

CREATE POLICY "Users can delete their own daily routines" ON public.daily_routines
FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.workout_routines WHERE id = routine_id));

-- Create RLS policies for routine exercises
CREATE POLICY "Users can view their own routine exercises" ON public.routine_exercises
FOR SELECT USING (auth.uid() = (
  SELECT wr.user_id FROM public.workout_routines wr 
  JOIN public.daily_routines dr ON dr.routine_id = wr.id 
  WHERE dr.id = daily_routine_id
));

CREATE POLICY "Users can create routine exercises in their own routines" ON public.routine_exercises
FOR INSERT WITH CHECK (auth.uid() = (
  SELECT wr.user_id FROM public.workout_routines wr 
  JOIN public.daily_routines dr ON dr.routine_id = wr.id 
  WHERE dr.id = daily_routine_id
));

CREATE POLICY "Users can update their own routine exercises" ON public.routine_exercises
FOR UPDATE USING (auth.uid() = (
  SELECT wr.user_id FROM public.workout_routines wr 
  JOIN public.daily_routines dr ON dr.routine_id = wr.id 
  WHERE dr.id = daily_routine_id
));

CREATE POLICY "Users can delete their own routine exercises" ON public.routine_exercises
FOR DELETE USING (auth.uid() = (
  SELECT wr.user_id FROM public.workout_routines wr 
  JOIN public.daily_routines dr ON dr.routine_id = wr.id 
  WHERE dr.id = daily_routine_id
));

-- Create RLS policies for workouts
CREATE POLICY "Users can view their own workouts" ON public.workouts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts" ON public.workouts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON public.workouts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON public.workouts
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for workout exercises
CREATE POLICY "Users can view their own workout exercises" ON public.workout_exercises
FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.workouts WHERE id = workout_id));

CREATE POLICY "Users can create workout exercises in their own workouts" ON public.workout_exercises
FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.workouts WHERE id = workout_id));

CREATE POLICY "Users can update their own workout exercises" ON public.workout_exercises
FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.workouts WHERE id = workout_id));

CREATE POLICY "Users can delete their own workout exercises" ON public.workout_exercises
FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.workouts WHERE id = workout_id));

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fitness_goals_updated_at
  BEFORE UPDATE ON public.fitness_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_routines_updated_at
  BEFORE UPDATE ON public.workout_routines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_routines_updated_at
  BEFORE UPDATE ON public.daily_routines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample exercises
INSERT INTO public.exercises (name, description, muscle_group, exercise_type, equipment, instructions) VALUES 
('Push-ups', 'Classic bodyweight chest exercise', 'chest', 'bodyweight', 'None', ARRAY['Start in plank position', 'Lower chest to ground', 'Push back up to starting position']),
('Pull-ups', 'Upper body pulling exercise', 'back', 'bodyweight', 'Pull-up bar', ARRAY['Hang from bar with palms facing away', 'Pull body up until chin clears bar', 'Lower back to starting position']),
('Squats', 'Lower body compound exercise', 'legs', 'bodyweight', 'None', ARRAY['Stand with feet shoulder-width apart', 'Lower body as if sitting back into chair', 'Return to standing position']),
('Bench Press', 'Chest strengthening exercise', 'chest', 'weights', 'Barbell, Bench', ARRAY['Lie on bench with feet flat on floor', 'Grip bar slightly wider than shoulders', 'Lower bar to chest, then press back up']),
('Deadlift', 'Full body compound exercise', 'full_body', 'weights', 'Barbell', ARRAY['Stand with feet hip-width apart', 'Bend at hips and knees to grip bar', 'Lift bar by extending hips and knees']),
('Running', 'Cardiovascular exercise', 'cardio', 'cardio', 'None', ARRAY['Start at comfortable pace', 'Maintain steady breathing', 'Land on midfoot, not heel']),
('Plank', 'Core strengthening exercise', 'core', 'bodyweight', 'None', ARRAY['Start in push-up position', 'Keep body straight from head to heels', 'Hold position while breathing normally']),
('Bicep Curls', 'Arm strengthening exercise', 'arms', 'weights', 'Dumbbells', ARRAY['Stand with feet shoulder-width apart', 'Hold weights at sides with palms forward', 'Curl weights up to shoulders, then lower']);