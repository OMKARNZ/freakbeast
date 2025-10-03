import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Check, Timer, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const WorkoutSession = () => {
  const { routineId, workoutId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedRoutineExerciseIds, setCompletedRoutineExerciseIds] = useState<Set<string>>(new Set());
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutPaused, setWorkoutPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (user) {
      if (workoutId) {
        fetchExistingWorkout();
      } else if (routineId) {
        fetchWorkoutData();
      }
    }
  }, [routineId, workoutId, user]);

  // Live timer update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (workoutStarted && !workoutPaused && startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = startTime.getTime();
        setElapsedTime(Math.floor((pausedTime + (now - start)) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workoutStarted, workoutPaused, startTime, pausedTime]);

  const fetchExistingWorkout = async () => {
    if (!user || !workoutId) return;

    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .eq('user_id', user.id)
      .single();

    if (workoutError) {
      console.error('Error fetching workout:', workoutError);
      navigate('/workouts');
      return;
    }

    setWorkout(workoutData);
    setWorkoutStarted(workoutData.status === 'in_progress');
    if (workoutData.started_at) {
      setStartTime(new Date(workoutData.started_at));
    }

    // Always base display on routine exercises for the workout's daily routine
    if (workoutData.daily_routine_id) {
      const { data: routineExercises, error: routineErr } = await supabase
        .from('routine_exercises')
        .select(`
          *,
          exercises (*)
        `)
        .eq('daily_routine_id', workoutData.daily_routine_id)
        .order('order_index');

      if (routineErr) {
        console.error('Error fetching routine exercises for workout:', routineErr);
        return;
      }
      setExercises(routineExercises || []);
    } else {
      setExercises([]);
    }
  };

  const fetchWorkoutData = async () => {
    if (!user || !routineId) return;

    // Fetch routine exercises
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('routine_exercises')
      .select(`
        *,
        exercises (*)
      `)
      .eq('daily_routine_id', routineId)
      .order('order_index');

    if (exercisesError) {
      console.error('Error fetching exercises:', exercisesError);
      return;
    }

    setExercises(exercisesData || []);
  };

  const startWorkout = () => {
    if (!routineId || exercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "Please add exercises to your routine before starting a workout.",
        variant: "destructive",
      });
      return;
    }
    
    setWorkoutStarted(true);
    setStartTime(new Date());
    
    // Create workout session in database
    createWorkoutSession();
  };

  const createWorkoutSession = async () => {
    if (!user || !routineId) return;

    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .insert([{
        user_id: user.id,
        daily_routine_id: routineId,
        name: 'Workout Session',
        status: 'in_progress',
        started_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (workoutError) {
      console.error('Error creating workout:', workoutError);
      toast({
        title: "Error", 
        description: "Failed to create workout session. Please check that you have exercises in your routine.",
        variant: "destructive",
      });
      setWorkoutStarted(false);
      return;
    }

    setWorkout(workoutData);
  };

  const completeExercise = async (routineExerciseId: string, exerciseId: string) => {
    setCompletedRoutineExerciseIds(new Set([...completedRoutineExerciseIds, routineExerciseId]));
    
    // Save exercise completion to database if workout exists
    if (workout) {
      try {
        await supabase
          .from('workout_exercises')
          .upsert({
            workout_id: workout.id,
            exercise_id: exerciseId,
            order_index: currentExerciseIndex,
            sets_completed: 1,
            completed_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error saving exercise completion:', error);
      }
    }
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const pauseWorkout = () => {
    if (workoutStarted && !workoutPaused) {
      setWorkoutPaused(true);
      if (startTime) {
        setPausedTime(prev => prev + (new Date().getTime() - startTime.getTime()));
      }
    }
  };

  const resumeWorkout = () => {
    if (workoutPaused) {
      setWorkoutPaused(false);
      setStartTime(new Date());
    }
  };

  const finishWorkout = async () => {
    if (!workout || !startTime) return;

    const endTime = new Date();
    const totalTime = workoutPaused 
      ? pausedTime + (endTime.getTime() - startTime.getTime())
      : endTime.getTime() - startTime.getTime();
    const duration = Math.round(totalTime / 60000); // minutes

    const { error } = await supabase
      .from('workouts')
      .update({
        status: 'completed',
        completed_at: endTime.toISOString(),
        total_duration_minutes: duration,
        notes: notes
      })
      .eq('id', workout.id);

    if (error) {
      console.error('Error updating workout:', error);
      toast({
        title: "Error",
        description: "Failed to finish workout. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Workout Complete!",
      description: `Great job! You completed your workout in ${duration} minutes.`,
    });

    navigate('/workouts');
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workouts')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-bold">Workout Session</h1>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant={workoutStarted ? (workoutPaused ? 'outline' : 'default') : 'secondary'} className="text-xs sm:text-sm">
            {workoutStarted ? (workoutPaused ? 'Paused' : 'In Progress') : 'Ready'}
          </Badge>
          {workoutStarted && (
            <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
              <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
        {workoutStarted && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={workoutPaused ? resumeWorkout : pauseWorkout}
            >
              {workoutPaused ? (
                <>
                  <Play className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={finishWorkout}
            >
              <Square className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Finish</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-4 space-y-4 sm:space-y-6">
        {!workoutStarted ? (
          <div className="text-center space-y-4 sm:space-y-6 px-4">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">Ready to start?</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                You have {exercises.length} exercises in this routine
              </p>
            </div>
            <Button onClick={startWorkout} size="lg" className="w-full max-w-xs mx-auto">
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-base sm:text-lg">Progress</span>
                  <div className="flex items-center space-x-2 text-sm sm:text-base">
                    <Timer className="w-4 h-4" />
                    <span className="font-bold">{formatTime(elapsedTime)}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${exercises.length > 0 ? (completedRoutineExerciseIds.size / exercises.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">
                    {completedRoutineExerciseIds.size}/{exercises.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Current Exercise */}
            {currentExercise && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">{currentExercise.exercises.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sets:</span>
                      <span className="ml-2 font-medium">{currentExercise.sets}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reps:</span>
                      <span className="ml-2 font-medium">{currentExercise.reps || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="ml-2 font-medium">{currentExercise.weight_kg ? `${currentExercise.weight_kg} kg` : 'Bodyweight'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rest:</span>
                      <span className="ml-2 font-medium">{currentExercise.rest_seconds}s</span>
                    </div>
                  </div>

                  {currentExercise.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{currentExercise.notes}</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => completeExercise(currentExercise.id, currentExercise.exercise_id)}
                    className="w-full"
                    disabled={completedRoutineExerciseIds.has(currentExercise.id)}
                  >
                    {completedRoutineExerciseIds.has(currentExercise.id) ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      'Mark as Done'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Workout Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about your workout..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Finish Workout */}
            {completedRoutineExerciseIds.size === exercises.length && exercises.length > 0 && (
              <Button onClick={finishWorkout} size="lg" className="w-full max-w-md mx-auto">
                <Check className="w-4 h-4 mr-2" />
                Finish Workout
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutSession;