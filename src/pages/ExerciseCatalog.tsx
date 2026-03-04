import { useState, useEffect } from 'react';
import { Search, Plus, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import CreateCustomExerciseDialog from '@/components/dialogs/CreateCustomExerciseDialog';

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  exercise_type: string;
  equipment: string;
  image_url: string | null;
  instructions: string[] | null;
}

const ExerciseCatalog = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      const exerciseList = data || [];
      setExercises(exerciseList);
      if (exerciseList.length > 0) setSelectedExercise(exerciseList[0]);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === 'all' || exercise.muscle_group === muscleFilter;
    const matchesEquipment = equipmentFilter === 'all' || exercise.equipment?.toLowerCase().includes(equipmentFilter.toLowerCase());
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const muscleGroups = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'full_body', 'cardio'];
  const equipmentTypes = ['none', 'dumbbells', 'barbell', 'pull-up bar', 'band'];
  const formatMuscle = (m: string) => m.charAt(0).toUpperCase() + m.slice(1).replace('_', ' ');

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowLibrary(false); // close library on mobile after selection
  };

  /* ---- Library sidebar (shared between mobile sheet and desktop column) ---- */
  const LibraryContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Library</h2>
        <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-3.5 h-3.5" />
          Custom Exercise
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Equipment</SelectItem>
            {equipmentTypes.map(eq => (
              <SelectItem key={eq} value={eq}>{eq.charAt(0).toUpperCase() + eq.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={muscleFilter} onValueChange={setMuscleFilter}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All Muscles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Muscles</SelectItem>
            {muscleGroups.map(m => (
              <SelectItem key={m} value={m}>{formatMuscle(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search Exercises"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-medium px-1 mb-2">Popular Exercises</p>

      <div className="flex-1 overflow-y-auto space-y-0.5 -mr-1 pr-1">
        {loading ? (
          <p className="text-center py-4 text-sm text-muted-foreground animate-pulse">Loading...</p>
        ) : filteredExercises.length === 0 ? (
          <p className="text-center py-4 text-sm text-muted-foreground">No exercises found</p>
        ) : (
          filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => handleSelectExercise(exercise)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                selectedExercise?.id === exercise.id
                  ? 'bg-primary/15 border border-primary/30'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {exercise.image_url ? (
                  <img src={exercise.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Dumbbell className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{exercise.name}</p>
                <p className="text-xs text-primary capitalize">{formatMuscle(exercise.muscle_group)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 h-full">
      {/* ===== Main Detail Panel ===== */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Exercise</h1>
          {/* Mobile toggle to open library */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowLibrary(!showLibrary)}
          >
            <Search className="w-4 h-4 mr-1.5" />
            Browse
          </Button>
        </div>

        {/* Mobile Library Drawer */}
        {showLibrary && (
          <div className="lg:hidden mb-4">
            <Card>
              <CardContent className="p-4 max-h-[60vh] overflow-y-auto">
                <LibraryContent />
              </CardContent>
            </Card>
          </div>
        )}

        {selectedExercise ? (
          <>
            {/* Exercise Info Card */}
            <Card className="mb-4">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-1 space-y-3 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold">{selectedExercise.name}</h2>
                    <div className="space-y-1.5">
                      <p className="text-sm text-muted-foreground">
                        Equipment: <span className="font-semibold text-foreground">{selectedExercise.equipment || 'Body weight'}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Primary Muscle Group: <span className="font-semibold text-foreground">{formatMuscle(selectedExercise.muscle_group)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Type: <span className="font-semibold text-foreground capitalize">{selectedExercise.exercise_type}</span>
                      </p>
                    </div>
                    {selectedExercise.description && (
                      <p className="text-sm text-muted-foreground">{selectedExercise.description}</p>
                    )}
                  </div>

                  <div className="w-full sm:w-56 md:w-64 lg:w-72 h-44 sm:h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {selectedExercise.image_url ? (
                      <img
                        src={selectedExercise.image_url}
                        alt={selectedExercise.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Dumbbell className="w-10 h-10" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="howto" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="statistics" className="text-xs sm:text-sm">Statistics</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
                <TabsTrigger value="howto" className="text-xs sm:text-sm">How to</TabsTrigger>
              </TabsList>

              <TabsContent value="statistics">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-muted-foreground text-sm">Complete workouts with this exercise to see your statistics here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-muted-foreground text-sm">Your workout history for this exercise will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="howto">
                <Card>
                  <CardContent className="p-4 sm:p-6 space-y-2">
                    {selectedExercise.instructions && selectedExercise.instructions.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-2">
                        {selectedExercise.instructions.map((step, i) => (
                          <li key={i} className="text-sm">{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-sm text-muted-foreground">No detailed instructions available yet.</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Target:</span> {formatMuscle(selectedExercise.muscle_group)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Equipment:</span> {selectedExercise.equipment || 'Body weight'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Select an exercise from the library</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ===== Desktop Library Sidebar ===== */}
      <div className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-l border-border pl-6 h-[calc(100vh-120px)] sticky top-6">
        <LibraryContent />
      </div>
      <CreateCustomExerciseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={fetchExercises}
      />
    </div>
  );
};

export default ExerciseCatalog;
