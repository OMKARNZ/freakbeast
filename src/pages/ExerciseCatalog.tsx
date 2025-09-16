import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  exercise_type: string;
  equipment: string;
}

const ExerciseCatalog = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');

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
      setExercises(data || []);
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Exercise name or muscle"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add Custom Exercise Button */}
      <div className="p-4 border-b border-border">
        <Button variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add custom
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold mb-4">Full exercises catalog</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Muscle</label>
            <Select value={muscleFilter} onValueChange={setMuscleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Any muscle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any muscle</SelectItem>
                {muscleGroups.map(muscle => (
                  <SelectItem key={muscle} value={muscle}>
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Equipment</label>
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Any equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any equipment</SelectItem>
                {equipmentTypes.map(equipment => (
                  <SelectItem key={equipment} value={equipment}>
                    {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Category</label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any category</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Loading exercises...</div>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No exercises found matching your criteria</p>
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Exercise Icon/Image Placeholder */}
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/20 rounded"></div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg">{exercise.name}</h3>
                    <p className="text-sm text-primary capitalize">
                      {exercise.muscle_group.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.equipment || 'Body weight'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExerciseCatalog;