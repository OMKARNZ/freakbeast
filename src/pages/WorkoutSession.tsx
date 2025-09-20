import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Check, RotateCcw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const WorkoutSession = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (routineId && user) {
      fetchWorkoutData();
    }
  }, [routineId, user]);

  const fetchWorkoutData = async () => {
    if (!user || !routineId) return;

    // Create a new workout session
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
      return;
    }

    setWorkout(workoutData);

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
    setWorkoutStarted(true);
    setStartTime(new Date());
  };

  const completeExercise = (exerciseId: string) => {
    setCompletedExercises(new Set([...completedExercises, exerciseId]));
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const finishWorkout = async () => {
    if (!workout || !startTime) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // minutes

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
      return;
    }

    toast({
      title: "Workout Complete!",
      description: `Great job! You completed your workout in ${duration} minutes.`,
    });

    navigate('/workouts');
  };

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workouts')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Workout Session</h1>
        </div>
        <Badge variant={workoutStarted ? 'default' : 'secondary'}>
          {workoutStarted ? 'In Progress' : 'Ready'}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {!workoutStarted ? (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Ready to start?</h2>
              <p className="text-muted-foreground">
                You have {exercises.length} exercises in this routine
              </p>
            </div>
            <Button onClick={startWorkout} size="lg" className="w-full max-w-xs">
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Progress</span>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm">
                      {startTime && Math.round((new Date().getTime() - startTime.getTime()) / 60000)}m
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(completedExercises.size / exercises.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {completedExercises.size}/{exercises.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Current Exercise */}
            {currentExercise && (
              <Card>
                <CardHeader>
                  <CardTitle>{currentExercise.exercises.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                    onClick={() => completeExercise(currentExercise.id)}
                    className="w-full"
                    disabled={completedExercises.has(currentExercise.id)}
                  >
                    {completedExercises.has(currentExercise.id) ? (
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
                <CardTitle>Workout Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about your workout..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Finish Workout */}
            {completedExercises.size === exercises.length && (
              <Button onClick={finishWorkout} size="lg" className="w-full">
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