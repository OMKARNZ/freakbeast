-- ==========================================
-- SUPABASE / POSTGRES PERFORMANCE OPTIMIZATIONS
-- (Error-Safe Version)
-- ==========================================
-- This script contains best-practice optimizations to drastically improve 
-- database response times and application speed. 
-- You can run this file directly in the Supabase Dashboard SQL Editor.
-- It is designed to skip any indexes if your table hasn't been created yet.

DO $$ 
DECLARE
    -- We use a PL/pgSQL block to safely attempt creating indexes
    -- without halting the entire script if your live database is missing a column.
BEGIN

    -- ==========================================
    -- 1. FOREIGN KEY INDEXES (High Priority)
    -- ==========================================
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_daily_routines_routine_id ON public.daily_routines (routine_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN
        RAISE NOTICE 'Skipped idx_daily_routines_routine_id';
    END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_routine_exercises_daily_routine_id ON public.routine_exercises (daily_routine_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN
        RAISE NOTICE 'Skipped idx_routine_exercises_daily_routine_id';
    END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_routine_exercises_exercise_id ON public.routine_exercises (exercise_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN
        RAISE NOTICE 'Skipped idx_routine_exercises_exercise_id';
    END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON public.workout_exercises (workout_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN
        RAISE NOTICE 'Skipped idx_workout_exercises_workout_id';
    END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON public.workout_exercises (exercise_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN
        RAISE NOTICE 'Skipped idx_workout_exercises_exercise_id';
    END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_workouts_daily_routine_id ON public.workouts (daily_routine_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN
        RAISE NOTICE 'Skipped idx_workouts_daily_routine_id';
    END;

    -- ==========================================
    -- 2. USER ID INDEXES (Critical for RLS)
    -- ==========================================
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_profiles_user_id'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON public.exercises (user_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_exercises_user_id'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_id ON public.fitness_goals (user_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_fitness_goals_user_id'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_workout_routines_user_id ON public.workout_routines (user_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_workout_routines_user_id'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts (user_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_workouts_user_id'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON public.user_verifications (user_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_user_verifications_user_id'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_weight_history_user_id ON public.weight_history (user_id);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_weight_history_user_id'; END;


    -- ==========================================
    -- 3. COMPOUND INDEXES FOR SPECIFIC QUERIES
    -- ==========================================
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_workouts_user_status_completed ON public.workouts (user_id, status, completed_at DESC);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_workouts_user_status_completed'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.fitness_goals (user_id, status);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_goals_user_status'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_routines_user_active ON public.workout_routines (user_id, is_active);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_routines_user_active'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_weight_history_user_date ON public.weight_history (user_id, recorded_at DESC);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_weight_history_user_date'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_routine_exercises_order ON public.routine_exercises (daily_routine_id, order_index);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_routine_exercises_order'; END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_workout_exercises_order ON public.workout_exercises (workout_id, order_index);
    EXCEPTION WHEN undefined_column OR undefined_table THEN RAISE NOTICE 'Skipped idx_workout_exercises_order'; END;

END $$;

-- ==========================================
-- 4. FULL TEXT SEARCH SETUP 
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$ 
BEGIN
    CREATE INDEX IF NOT EXISTS idx_exercises_name_search ON public.exercises USING gin(name gin_trgm_ops);
EXCEPTION WHEN undefined_column OR undefined_table THEN 
    RAISE NOTICE 'Skipped idx_exercises_name_search'; 
END $$;

-- ==========================================
-- 5. ANALYZE STATISTICS 
-- (Tells query planner to use the new indexes)
-- ==========================================
-- Will silently ignore tables that don't exist yet
DO $$ 
BEGIN
    ANALYZE public.profiles;
    ANALYZE public.exercises;
    ANALYZE public.fitness_goals;
    ANALYZE public.workout_routines;
    ANALYZE public.daily_routines;
    ANALYZE public.routine_exercises;
    ANALYZE public.workouts;
    ANALYZE public.workout_exercises;
    ANALYZE public.weight_history;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Skipped analyzing some tables as they do not exist.';
END $$;
