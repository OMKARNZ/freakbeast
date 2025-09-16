import { useState } from 'react';
import { Plus, MoreVertical, Play, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const Workouts = () => {
  const navigate = useNavigate();
  const [showNewRoutineDialog, setShowNewRoutineDialog] = useState(false);
  const [routineName, setRoutineName] = useState('');

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating routine:', routineName);
    setRoutineName('');
    setShowNewRoutineDialog(false);
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
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Empty State Illustration */}
        <div className="text-center space-y-6 max-w-sm">
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
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    placeholder="Enter routine name"
                    className="border-primary/20 focus:border-primary"
                    required
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
                    OK
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
      </div>
    </div>
  );
};

export default Workouts;