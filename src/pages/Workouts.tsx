import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Play, MoreHorizontal, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Workouts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [routines, setRoutines] = useState([]);
  const [showNewRoutineDialog, setShowNewRoutineDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchRoutines = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching routines:', error);
      return;
    }

    setRoutines(data || []);
  };

  useEffect(() => {
    fetchRoutines();
  }, [user]);

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase
      .from('workout_routines')
      .insert([{
        ...formData,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create routine. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Routine created successfully!",
    });

    setFormData({ name: '', description: '' });
    setShowNewRoutineDialog(false);
    fetchRoutines();
    
    // Navigate to routine details
    navigate(`/routines/${data.id}`);
  };

  const navigateToExercises = () => {
    navigate('/exercises');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold">My Workout Plan</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <span>Delete</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Manage Routines</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Reminders</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {routines.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="relative mx-auto w-48 h-32">
              {/* Clipboard illustration */}
              <div className="absolute inset-0 bg-gradient-card rounded-lg shadow-card transform rotate-2">
                <div className="p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="h-2 bg-muted rounded flex-1"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="h-2 bg-muted rounded flex-1"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
                    <div className="h-2 bg-muted-foreground/30 rounded flex-1"></div>
                  </div>
                </div>
              </div>
              
              {/* Timer illustration */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-button">
                <div className="w-6 h-6 border-2 border-primary-foreground rounded-full relative">
                  <div className="absolute top-1 left-1/2 w-0.5 h-2 bg-primary-foreground transform -translate-x-1/2 origin-bottom rotate-45"></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">No routines yet</h2>
              <p className="text-muted-foreground text-sm">
                Create your first workout routine to get started with your fitness journey
              </p>
            </div>

            <Dialog open={showNewRoutineDialog} onOpenChange={setShowNewRoutineDialog}>
              <DialogTrigger asChild>
                <Button className="w-full max-w-xs">
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first routine
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>New Routine</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateRoutine} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="routine-name">Routine Name</Label>
                    <Input
                      id="routine-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter routine name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routine-description">Description</Label>
                    <Textarea
                      id="routine-description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your routine..."
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowNewRoutineDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Create
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Quick Actions */}
            <div className="mt-8 flex justify-center">
              <div className="bg-primary rounded-full p-4 flex items-center space-x-6">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={navigateToExercises}
                >
                  <Plus className="w-5 h-5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Play className="w-5 h-5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Routines List */
          <div className="space-y-4">
            {routines.map((routine: any) => (
              <Card key={routine.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/routines/${routine.id}`)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{routine.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={routine.is_active ? 'default' : 'secondary'}>
                          {routine.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(routine.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                {routine.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{routine.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
            
            {/* Add New Routine Card */}
            <Dialog open={showNewRoutineDialog} onOpenChange={setShowNewRoutineDialog}>
              <DialogTrigger asChild>
                <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <Plus className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Add New Routine</p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>New Routine</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateRoutine} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="routine-name-2">Routine Name</Label>
                    <Input
                      id="routine-name-2"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter routine name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routine-description-2">Description</Label>
                    <Textarea
                      id="routine-description-2"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your routine..."
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowNewRoutineDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Create
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workouts;