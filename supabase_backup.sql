


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."exercise_type" AS ENUM (
    'weights',
    'bodyweight',
    'cardio',
    'flexibility',
    'other'
);


ALTER TYPE "public"."exercise_type" OWNER TO "postgres";


CREATE TYPE "public"."goal_status" AS ENUM (
    'active',
    'completed',
    'paused',
    'cancelled'
);


ALTER TYPE "public"."goal_status" OWNER TO "postgres";


CREATE TYPE "public"."goal_type" AS ENUM (
    'weight_loss',
    'weight_gain',
    'muscle_building',
    'strength',
    'endurance',
    'general_fitness',
    'muscle_gain'
);


ALTER TYPE "public"."goal_type" OWNER TO "postgres";


CREATE TYPE "public"."muscle_group" AS ENUM (
    'chest',
    'back',
    'shoulders',
    'arms',
    'core',
    'legs',
    'full_body',
    'cardio'
);


ALTER TYPE "public"."muscle_group" OWNER TO "postgres";


CREATE TYPE "public"."workout_status" AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'skipped'
);


ALTER TYPE "public"."workout_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."daily_routines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "routine_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "estimated_duration_minutes" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "daily_routines_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."daily_routines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "muscle_group" "public"."muscle_group" NOT NULL,
    "exercise_type" "public"."exercise_type" NOT NULL,
    "equipment" "text",
    "instructions" "text"[],
    "image_url" "text",
    "video_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid"
);


ALTER TABLE "public"."exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fitness_goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "goal_type" "public"."goal_type" NOT NULL,
    "target_value" numeric(10,2),
    "current_value" numeric(10,2) DEFAULT 0,
    "unit" "text",
    "target_date" "date",
    "status" "public"."goal_status" DEFAULT 'active'::"public"."goal_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."fitness_goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "full_name" "text",
    "age" integer,
    "height_cm" integer,
    "weight_kg" numeric(5,2),
    "gender" "text",
    "activity_level" "text",
    "bmi" numeric(4,1) GENERATED ALWAYS AS (
CASE
    WHEN (("height_cm" > 0) AND ("weight_kg" > (0)::numeric)) THEN "round"(("weight_kg" / "power"((("height_cm")::numeric / 100.0), (2)::numeric)), 1)
    ELSE NULL::numeric
END) STORED,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routine_exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "daily_routine_id" "uuid" NOT NULL,
    "exercise_id" "uuid" NOT NULL,
    "order_index" integer NOT NULL,
    "sets" integer DEFAULT 1 NOT NULL,
    "reps" integer,
    "weight_kg" numeric(6,2),
    "duration_seconds" integer,
    "distance_meters" numeric(8,2),
    "rest_seconds" integer DEFAULT 60,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."routine_exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "verified_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "verification_type" "text" DEFAULT 'email'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_verifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weight_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "weight_kg" numeric NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."weight_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workout_exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_id" "uuid" NOT NULL,
    "exercise_id" "uuid" NOT NULL,
    "order_index" integer NOT NULL,
    "sets_completed" integer DEFAULT 0 NOT NULL,
    "target_sets" integer,
    "target_reps" integer,
    "target_weight_kg" numeric(6,2),
    "target_duration_seconds" integer,
    "target_distance_meters" numeric(8,2),
    "actual_reps" integer[],
    "actual_weight_kg" numeric(6,2)[],
    "actual_duration_seconds" integer,
    "actual_distance_meters" numeric(8,2),
    "rest_seconds" integer,
    "notes" "text",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."workout_exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workout_routines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."workout_routines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "daily_routine_id" "uuid",
    "name" "text" NOT NULL,
    "status" "public"."workout_status" DEFAULT 'planned'::"public"."workout_status" NOT NULL,
    "scheduled_date" "date",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "total_duration_minutes" integer,
    "calories_burned" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."workouts" OWNER TO "postgres";


ALTER TABLE ONLY "public"."daily_routines"
    ADD CONSTRAINT "daily_routines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_routines"
    ADD CONSTRAINT "daily_routines_routine_id_day_of_week_key" UNIQUE ("routine_id", "day_of_week");



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fitness_goals"
    ADD CONSTRAINT "fitness_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."routine_exercises"
    ADD CONSTRAINT "routine_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_verifications"
    ADD CONSTRAINT "user_verifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weight_history"
    ADD CONSTRAINT "weight_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_routines"
    ADD CONSTRAINT "workout_routines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_weight_history_user_recorded" ON "public"."weight_history" USING "btree" ("user_id", "recorded_at" DESC);



CREATE OR REPLACE TRIGGER "update_daily_routines_updated_at" BEFORE UPDATE ON "public"."daily_routines" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_fitness_goals_updated_at" BEFORE UPDATE ON "public"."fitness_goals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workout_routines_updated_at" BEFORE UPDATE ON "public"."workout_routines" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workouts_updated_at" BEFORE UPDATE ON "public"."workouts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."daily_routines"
    ADD CONSTRAINT "daily_routines_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "public"."workout_routines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fitness_goals"
    ADD CONSTRAINT "fitness_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_exercises"
    ADD CONSTRAINT "routine_exercises_daily_routine_id_fkey" FOREIGN KEY ("daily_routine_id") REFERENCES "public"."daily_routines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_exercises"
    ADD CONSTRAINT "routine_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_routines"
    ADD CONSTRAINT "workout_routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_daily_routine_id_fkey" FOREIGN KEY ("daily_routine_id") REFERENCES "public"."daily_routines"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Everyone can view exercises" ON "public"."exercises" FOR SELECT USING (true);



CREATE POLICY "Users can create daily routines in their own workout routines" ON "public"."daily_routines" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "workout_routines"."user_id"
   FROM "public"."workout_routines"
  WHERE ("workout_routines"."id" = "daily_routines"."routine_id"))));



CREATE POLICY "Users can create routine exercises in their own routines" ON "public"."routine_exercises" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "wr"."user_id"
   FROM ("public"."workout_routines" "wr"
     JOIN "public"."daily_routines" "dr" ON (("dr"."routine_id" = "wr"."id")))
  WHERE ("dr"."id" = "routine_exercises"."daily_routine_id"))));



CREATE POLICY "Users can create their own exercises" ON "public"."exercises" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own goals" ON "public"."fitness_goals" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own routines" ON "public"."workout_routines" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own verifications" ON "public"."user_verifications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own weight entries" ON "public"."weight_history" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own workouts" ON "public"."workouts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create workout exercises in their own workouts" ON "public"."workout_exercises" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "workouts"."user_id"
   FROM "public"."workouts"
  WHERE ("workouts"."id" = "workout_exercises"."workout_id"))));



CREATE POLICY "Users can delete their own daily routines" ON "public"."daily_routines" FOR DELETE USING (("auth"."uid"() = ( SELECT "workout_routines"."user_id"
   FROM "public"."workout_routines"
  WHERE ("workout_routines"."id" = "daily_routines"."routine_id"))));



CREATE POLICY "Users can delete their own exercises" ON "public"."exercises" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own goals" ON "public"."fitness_goals" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own routine exercises" ON "public"."routine_exercises" FOR DELETE USING (("auth"."uid"() = ( SELECT "wr"."user_id"
   FROM ("public"."workout_routines" "wr"
     JOIN "public"."daily_routines" "dr" ON (("dr"."routine_id" = "wr"."id")))
  WHERE ("dr"."id" = "routine_exercises"."daily_routine_id"))));



CREATE POLICY "Users can delete their own routines" ON "public"."workout_routines" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own weight entries" ON "public"."weight_history" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own workout exercises" ON "public"."workout_exercises" FOR DELETE USING (("auth"."uid"() = ( SELECT "workouts"."user_id"
   FROM "public"."workouts"
  WHERE ("workouts"."id" = "workout_exercises"."workout_id"))));



CREATE POLICY "Users can delete their own workouts" ON "public"."workouts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own daily routines" ON "public"."daily_routines" FOR UPDATE USING (("auth"."uid"() = ( SELECT "workout_routines"."user_id"
   FROM "public"."workout_routines"
  WHERE ("workout_routines"."id" = "daily_routines"."routine_id"))));



CREATE POLICY "Users can update their own exercises" ON "public"."exercises" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own goals" ON "public"."fitness_goals" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own routine exercises" ON "public"."routine_exercises" FOR UPDATE USING (("auth"."uid"() = ( SELECT "wr"."user_id"
   FROM ("public"."workout_routines" "wr"
     JOIN "public"."daily_routines" "dr" ON (("dr"."routine_id" = "wr"."id")))
  WHERE ("dr"."id" = "routine_exercises"."daily_routine_id"))));



CREATE POLICY "Users can update their own routines" ON "public"."workout_routines" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own weight entries" ON "public"."weight_history" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own workout exercises" ON "public"."workout_exercises" FOR UPDATE USING (("auth"."uid"() = ( SELECT "workouts"."user_id"
   FROM "public"."workouts"
  WHERE ("workouts"."id" = "workout_exercises"."workout_id"))));



CREATE POLICY "Users can update their own workouts" ON "public"."workouts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own daily routines" ON "public"."daily_routines" FOR SELECT USING (("auth"."uid"() = ( SELECT "workout_routines"."user_id"
   FROM "public"."workout_routines"
  WHERE ("workout_routines"."id" = "daily_routines"."routine_id"))));



CREATE POLICY "Users can view their own goals" ON "public"."fitness_goals" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own routine exercises" ON "public"."routine_exercises" FOR SELECT USING (("auth"."uid"() = ( SELECT "wr"."user_id"
   FROM ("public"."workout_routines" "wr"
     JOIN "public"."daily_routines" "dr" ON (("dr"."routine_id" = "wr"."id")))
  WHERE ("dr"."id" = "routine_exercises"."daily_routine_id"))));



CREATE POLICY "Users can view their own routines" ON "public"."workout_routines" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own verifications" ON "public"."user_verifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own weight history" ON "public"."weight_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own workout exercises" ON "public"."workout_exercises" FOR SELECT USING (("auth"."uid"() = ( SELECT "workouts"."user_id"
   FROM "public"."workouts"
  WHERE ("workouts"."id" = "workout_exercises"."workout_id"))));



CREATE POLICY "Users can view their own workouts" ON "public"."workouts" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."daily_routines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fitness_goals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."routine_exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_verifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weight_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workout_exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workout_routines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workouts" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."daily_routines" TO "anon";
GRANT ALL ON TABLE "public"."daily_routines" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_routines" TO "service_role";



GRANT ALL ON TABLE "public"."exercises" TO "anon";
GRANT ALL ON TABLE "public"."exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."exercises" TO "service_role";



GRANT ALL ON TABLE "public"."fitness_goals" TO "anon";
GRANT ALL ON TABLE "public"."fitness_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."fitness_goals" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."routine_exercises" TO "anon";
GRANT ALL ON TABLE "public"."routine_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."routine_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."user_verifications" TO "anon";
GRANT ALL ON TABLE "public"."user_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."user_verifications" TO "service_role";



GRANT ALL ON TABLE "public"."weight_history" TO "anon";
GRANT ALL ON TABLE "public"."weight_history" TO "authenticated";
GRANT ALL ON TABLE "public"."weight_history" TO "service_role";



GRANT ALL ON TABLE "public"."workout_exercises" TO "anon";
GRANT ALL ON TABLE "public"."workout_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."workout_routines" TO "anon";
GRANT ALL ON TABLE "public"."workout_routines" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_routines" TO "service_role";



GRANT ALL ON TABLE "public"."workouts" TO "anon";
GRANT ALL ON TABLE "public"."workouts" TO "authenticated";
GRANT ALL ON TABLE "public"."workouts" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































