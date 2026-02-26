import { useState, useEffect } from 'react';
import { Search, Plus, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-80px)]">
      {/* Main Exercise Detail Panel */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold mb-6">Exercise</h1>

        {selectedExercise ? (
          <>
            {/* Exercise Info Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Text Info */}
                  <div className="flex-1 space-y-4">
                    <h2 className="text-2xl font-bold">{selectedExercise.name}</h2>
                    <div className="space-y-2">
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
                      <p className="text-sm text-muted-foreground mt-2">{selectedExercise.description}</p>
                    )}
                  </div>

                  {/* Exercise Image */}
                  <div className="w-full md:w-72 h-52 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {selectedExercise.image_url ? (
                      <img
                        src={selectedExercise.image_url}
                        alt={selectedExercise.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Dumbbell className="w-12 h-12" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Statistics / History / How to */}
            <Tabs defaultValue="howto" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="howto">How to</TabsTrigger>
              </TabsList>

              <TabsContent value="statistics">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-sm">Complete workouts with this exercise to see your statistics here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-sm">Your workout history for this exercise will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="howto">
                <Card>
                  <CardContent className="p-6 space-y-3">
                    {selectedExercise.instructions && selectedExercise.instructions.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-2">
                        {selectedExercise.instructions.map((step, i) => (
                          <li key={i} className="text-sm text-foreground">{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          No instructions available for this exercise yet.
                        </p>
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
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select an exercise from the library</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Sidebar - Exercise Library */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Library</h2>
          <Button variant="ghost" size="sm" className="text-primary gap-1">
            <Plus className="w-4 h-4" />
            Custom Exercise
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-4">
          <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Equipment</SelectItem>
              {equipmentTypes.map(eq => (
                <SelectItem key={eq} value={eq}>
                  {eq.charAt(0).toUpperCase() + eq.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={muscleFilter} onValueChange={setMuscleFilter}>
            <SelectTrigger>
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
              className="pl-10"
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-1 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-center py-4 text-sm text-muted-foreground animate-pulse">Loading...</p>
          ) : filteredExercises.length === 0 ? (
            <p className="text-center py-4 text-sm text-muted-foreground">No exercises found</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-medium px-2 py-2">Popular Exercises</p>
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                    selectedExercise?.id === exercise.id
                      ? 'bg-accent/20 border border-primary/30'
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
                    <p className="text-sm font-medium truncate">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{formatMuscle(exercise.muscle_group)}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCatalog;
