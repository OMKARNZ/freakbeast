import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Play, MoreHorizontal, Calendar, Clock, Edit, Copy, Share2, Trash2, Check } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [renameData, setRenameData] = useState({
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

  const handleRename = (routine: any) => {
    setSelectedRoutine(routine);
    setRenameData({
      name: routine.name,
      description: routine.description || ''
    });
    setShowRenameDialog(true);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoutine || !user) return;

    const { error } = await supabase
      .from('workout_routines')
      .update({
        name: renameData.name,
        description: renameData.description
      })
      .eq('id', selectedRoutine.id)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to rename routine. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Routine renamed successfully!",
    });

    setShowRenameDialog(false);
    setSelectedRoutine(null);
    setRenameData({ name: '', description: '' });
    fetchRoutines();
  };

  const handleDuplicate = async (routine: any) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workout_routines')
      .insert([{
        name: `${routine.name} (Copy)`,
        description: routine.description,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate routine. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Also duplicate daily routines and exercises
    const { data: dailyRoutines } = await supabase
      .from('daily_routines')
      .select('*, routine_exercises(*)')
      .eq('routine_id', routine.id);

    if (dailyRoutines && dailyRoutines.length > 0) {
      for (const dailyRoutine of dailyRoutines) {
        const { data: newDailyRoutine, error: dailyError } = await supabase
          .from('daily_routines')
          .insert([{
            routine_id: data.id,
            day_of_week: dailyRoutine.day_of_week,
            name: dailyRoutine.name,
            description: dailyRoutine.description,
            estimated_duration_minutes: dailyRoutine.estimated_duration_minutes
          }])
          .select()
          .single();

        if (!dailyError && newDailyRoutine && dailyRoutine.routine_exercises) {
          const exercisesToInsert = dailyRoutine.routine_exercises.map((exercise: any) => ({
            daily_routine_id: newDailyRoutine.id,
            exercise_id: exercise.exercise_id,
            order_index: exercise.order_index,
            sets: exercise.sets,
            reps: exercise.reps,
            weight_kg: exercise.weight_kg,
            duration_seconds: exercise.duration_seconds,
            distance_meters: exercise.distance_meters,
            rest_seconds: exercise.rest_seconds,
            notes: exercise.notes
          }));

          await supabase
            .from('routine_exercises')
            .insert(exercisesToInsert);
        }
      }
    }

    toast({
      title: "Success",
      description: "Routine duplicated successfully!",
    });

    fetchRoutines();
  };

  const handleShare = async (routine: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${routine.name} - Workout Routine`,
          text: routine.description || 'Check out this workout routine!',
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing or sharing failed
        console.log('Sharing cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${routine.name}\n${routine.description || ''}\n\nShared from FitTracker`;
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard",
          description: "Routine details copied to clipboard for sharing!",
        });
      } catch (error) {
        toast({
          title: "Share",
          description: "Share functionality is not available on this device.",
        });
      }
    }
  };

  const handleDeleteAll = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete routines. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "All routines deleted successfully!",
    });
    
    fetchRoutines();
  };

  const handleManageRoutines = () => {
    toast({
      title: "Manage Routines",
      description: "Routine management interface would open here",
    });
  };

  const handleReminders = () => {
    toast({
      title: "Reminders",
      description: "Reminder settings would be configured here",
    });
  };

  const handleDeleteRoutine = async (routineId: string) => {
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete routine. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Routine deleted successfully!",
    });
    
    fetchRoutines();
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
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleManageRoutines()}>
              <Edit className="w-4 h-4 mr-2" />
              <span>Manage Routines</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReminders()}>
              <Clock className="w-4 h-4 mr-2" />
              <span>Reminders</span>
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="text-destructive">Delete All</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Routines</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all your workout routines? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
              <DialogContent className="sm:max-w-md mx-4">
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
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
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
                {/* Removed extra buttons per user request - keeping only Add */}
              </div>
            </div>
          </div>
        ) : (
          /* Routines List */
          <div className="space-y-4">
            {routines.map((routine: any) => (
              <Card key={routine.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="space-y-1 flex-1" onClick={() => navigate(`/routines/${routine.id}`)}>
                      <CardTitle className="text-lg">{routine.name}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={routine.is_active ? 'default' : 'secondary'}>
                          {routine.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(routine.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/routines/${routine.id}`);
                        }}
                        className="flex-shrink-0"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Start</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleRename(routine)}>
                            <Edit className="w-4 h-4 mr-2" />
                            <span>Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(routine)}>
                            <Copy className="w-4 h-4 mr-2" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(routine)}>
                            <Share2 className="w-4 h-4 mr-2" />
                            <span>Share</span>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span className="text-destructive">Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Routine</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{routine.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteRoutine(routine.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                {routine.description && (
                  <CardContent onClick={() => navigate(`/routines/${routine.id}`)}>
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
              <DialogContent className="sm:max-w-md mx-4">
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
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
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

        {/* Rename Dialog */}
        <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Rename Routine</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rename-name">Routine Name</Label>
                <Input
                  id="rename-name"
                  value={renameData.name}
                  onChange={(e) => setRenameData({...renameData, name: e.target.value})}
                  placeholder="Enter routine name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rename-description">Description</Label>
                <Textarea
                  id="rename-description"
                  value={renameData.description}
                  onChange={(e) => setRenameData({...renameData, description: e.target.value})}
                  placeholder="Describe your routine..."
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowRenameDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Workouts;