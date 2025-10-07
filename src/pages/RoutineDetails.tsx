import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Clock, Dumbbell, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PredefinedPlansDialog } from '@/components/PredefinedPlansDialog';

const RoutineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [routine, setRoutine] = useState<any>(null);
  const [dailyRoutines, setDailyRoutines] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [routineExercises, setRoutineExercises] = useState<{[key: string]: any[]}>({});
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [showPredefinedDialog, setShowPredefinedDialog] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [dayForm, setDayForm] = useState({
    name: '',
    description: '',
    day_of_week: '',
    estimated_duration_minutes: ''
  });
  const [exerciseForm, setExerciseForm] = useState({
    exercise_id: '',
    sets: '3',
    reps: '',
    weight_kg: '',
    duration_seconds: '',
    rest_seconds: '60',
    notes: ''
  });

  const daysOfWeek = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '0', label: 'Sunday' }
  ];

  const fetchRoutineDetails = async () => {
    if (!id || !user) return;

    // Fetch routine
    const { data: routineData, error: routineError } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (routineError) {
      toast({
        title: "Error",
        description: "Failed to load routine details.",
        variant: "destructive",
      });
      navigate('/workouts');
      return;
    }

    setRoutine(routineData);

    // Fetch daily routines
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_routines')
      .select('*')
      .eq('routine_id', id)
      .order('day_of_week');

    if (!dailyError) {
      setDailyRoutines(dailyData || []);
      
      // Fetch exercises for each daily routine
      if (dailyData && dailyData.length > 0) {
        const exercisePromises = dailyData.map(async (dailyRoutine: any) => {
          const { data: exerciseData } = await supabase
            .from('routine_exercises')
            .select(`
              *,
              exercises (*)
            `)
            .eq('daily_routine_id', dailyRoutine.id)
            .order('order_index');
          
          return { dailyRoutineId: dailyRoutine.id, exercises: exerciseData || [] };
        });
        
        const exerciseResults = await Promise.all(exercisePromises);
        const exerciseMap: {[key: string]: any[]} = {};
        exerciseResults.forEach(result => {
          exerciseMap[result.dailyRoutineId] = result.exercises;
        });
        setRoutineExercises(exerciseMap);
      }
    }
  };

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (!error) {
      setExercises(data || []);
    }
  };

  useEffect(() => {
    fetchRoutineDetails();
    fetchExercises();
  }, [id, user]);

  const handleCreateDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    const { error } = await supabase
      .from('daily_routines')
      .insert([{
        ...dayForm,
        routine_id: id,
        day_of_week: parseInt(dayForm.day_of_week),
        estimated_duration_minutes: dayForm.estimated_duration_minutes ? parseInt(dayForm.estimated_duration_minutes) : null
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create daily routine.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Daily routine created successfully!",
    });

    setDayForm({
      name: '',
      description: '',
      day_of_week: '',
      estimated_duration_minutes: ''
    });
    setShowDayDialog(false);
    fetchRoutineDetails();
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDayId) return;

    if (!exerciseForm.exercise_id) {
      toast({
        title: "Select exercise",
        description: "Please choose an exercise before adding.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('routine_exercises')
      .insert([{
        daily_routine_id: selectedDayId,
        exercise_id: exerciseForm.exercise_id,
        sets: parseInt(exerciseForm.sets),
        reps: exerciseForm.reps ? parseInt(exerciseForm.reps) : null,
        weight_kg: exerciseForm.weight_kg ? parseFloat(exerciseForm.weight_kg) : null,
        duration_seconds: exerciseForm.duration_seconds ? parseInt(exerciseForm.duration_seconds) : null,
        rest_seconds: parseInt(exerciseForm.rest_seconds),
        notes: exerciseForm.notes,
         order_index: (routineExercises[selectedDayId]?.length || 0) + 1 // maintain correct order
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add exercise.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Exercise added successfully!",
    });

    setExerciseForm({
      exercise_id: '',
      sets: '3',
      reps: '',
      weight_kg: '',
      duration_seconds: '',
      rest_seconds: '60',
      notes: ''
    });
    setShowExerciseDialog(false);
    setSelectedDayId('');
    fetchRoutineDetails();
  };

  const handleStartWorkout = async (dailyRoutineId: string) => {
    if (!user) return;

    // Create a new workout session
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .insert([{
        user_id: user.id,
        daily_routine_id: dailyRoutineId,
        name: 'Workout Session',
        status: 'in_progress',
        started_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (workoutError) {
      toast({
        title: "Error",
        description: "Failed to start workout session.",
        variant: "destructive",
      });
      return;
    }

    navigate(`/workout-session/workout/${workoutData.id}`);
  };

  const handleDeleteDay = async (dayId: string) => {
    const { error } = await supabase
      .from('daily_routines')
      .delete()
      .eq('id', dayId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete daily routine.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Daily routine deleted successfully!",
    });

    fetchRoutineDetails();
  };

  const handleApplyPredefinedPlan = async (planExercises: any[], targetDayId: string) => {
    // Match predefined exercise names to actual exercise IDs from database
    const exerciseNameMap: { [key: string]: string } = {};
    
    for (const planEx of planExercises) {
      const { data: matchedExercises } = await supabase
        .from('exercises')
        .select('id')
        .ilike('name', `%${planEx.name}%`)
        .limit(1);
      
      if (matchedExercises && matchedExercises.length > 0) {
        exerciseNameMap[planEx.name] = matchedExercises[0].id;
      }
    }

    // Insert exercises for the target day
    const exercisesToInsert = planExercises
      .filter(ex => exerciseNameMap[ex.name])
      .map((ex, index) => ({
        daily_routine_id: targetDayId,
        exercise_id: exerciseNameMap[ex.name],
        order_index: (routineExercises[targetDayId]?.length || 0) + index + 1,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest,
        notes: null,
        weight_kg: null,
        duration_seconds: null
      }));

    if (exercisesToInsert.length === 0) {
      throw new Error('No matching exercises found');
    }

    const { error } = await supabase
      .from('routine_exercises')
      .insert(exercisesToInsert);

    if (error) throw error;

    fetchRoutineDetails();
  };

  if (!routine) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workouts')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-bold">{routine.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowPredefinedDialog(true)}>
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Predefined Plans</span>
            <span className="sm:hidden">Plans</span>
          </Button>
          <Dialog open={showDayDialog} onOpenChange={setShowDayDialog}>
            <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Day
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Add Daily Routine</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDay} className="space-y-4">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select value={dayForm.day_of_week} onValueChange={(value) => setDayForm({...dayForm, day_of_week: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent className="z-[60] bg-background">
                    {daysOfWeek.map(day => (
                      <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={dayForm.name}
                  onChange={(e) => setDayForm({...dayForm, name: e.target.value})}
                  placeholder="e.g., Push Day, Legs"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Duration (minutes)</Label>
                <Input
                  type="number"
                  value={dayForm.estimated_duration_minutes}
                  onChange={(e) => setDayForm({...dayForm, estimated_duration_minutes: e.target.value})}
                  placeholder="60"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={dayForm.description}
                  onChange={(e) => setDayForm({...dayForm, description: e.target.value})}
                  placeholder="Describe this day's focus..."
                />
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDayDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Add Day</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {routine.description && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-muted-foreground">{routine.description}</p>
            </CardContent>
          </Card>
        )}

        {dailyRoutines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-card rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Daily Routines</h3>
              <p className="text-muted-foreground text-sm">
                Add daily routines to organize your weekly workout plan
              </p>
            </div>
            <Button onClick={() => setShowDayDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Day
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {dailyRoutines.map((day: any) => (
              <Card key={day.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-base sm:text-lg">{day.name}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {daysOfWeek.find(d => d.value === day.day_of_week.toString())?.label}
                        </Badge>
                        {day.estimated_duration_minutes && (
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            {day.estimated_duration_minutes}min
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {routineExercises[day.id] && routineExercises[day.id].length > 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStartWorkout(day.id)}
                          className="flex-shrink-0"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Start Workout</span>
                          <span className="sm:hidden">Start</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDayId(day.id);
                          setShowExerciseDialog(true);
                        }}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Add Exercise</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Daily Routine</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{day.name}"? This will also delete all exercises in this routine.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteDay(day.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                {(day.description || (routineExercises[day.id] && routineExercises[day.id].length > 0)) && (
                  <CardContent>
                    {day.description && (
                      <p className="text-sm text-muted-foreground mb-3">{day.description}</p>
                    )}
                    {routineExercises[day.id] && routineExercises[day.id].length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Exercises ({routineExercises[day.id].length})</h4>
                        <div className="grid gap-2">
                          {routineExercises[day.id].map((exercise: any, index: number) => (
                            <div key={exercise.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <span className="text-sm font-medium">{exercise.exercises.name}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {exercise.sets} sets
                                {exercise.reps && ` × ${exercise.reps} reps`}
                                {exercise.weight_kg && ` @ ${exercise.weight_kg}kg`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExercise} className="space-y-4">
            <div className="space-y-2">
              <Label>Exercise</Label>
              <Select value={exerciseForm.exercise_id} onValueChange={(value) => setExerciseForm({...exerciseForm, exercise_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent className="z-[60] bg-background">
                  {exercises.map((exercise: any) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      <div className="flex items-center space-x-2">
                        <Dumbbell className="w-4 h-4" />
                        <span>{exercise.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sets</Label>
                <Input
                  type="number"
                  value={exerciseForm.sets}
                  onChange={(e) => setExerciseForm({...exerciseForm, sets: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Reps</Label>
                <Input
                  type="number"
                  value={exerciseForm.reps}
                  onChange={(e) => setExerciseForm({...exerciseForm, reps: e.target.value})}
                  placeholder="12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={exerciseForm.weight_kg}
                  onChange={(e) => setExerciseForm({...exerciseForm, weight_kg: e.target.value})}
                  placeholder="20"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={exerciseForm.duration_seconds}
                  onChange={(e) => setExerciseForm({...exerciseForm, duration_seconds: e.target.value})}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rest Time (seconds)</Label>
              <Input
                type="number"
                value={exerciseForm.rest_seconds}
                onChange={(e) => setExerciseForm({...exerciseForm, rest_seconds: e.target.value})}
                placeholder="60"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={exerciseForm.notes}
                onChange={(e) => setExerciseForm({...exerciseForm, notes: e.target.value})}
                placeholder="Any specific instructions or notes..."
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowExerciseDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Exercise
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PredefinedPlansDialog 
        open={showPredefinedDialog} 
        onOpenChange={setShowPredefinedDialog}
        dailyRoutines={dailyRoutines}
        onApplyPlan={handleApplyPredefinedPlan}
      />
    </div>
  );
};

export default RoutineDetails;