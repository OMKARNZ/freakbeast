import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PredefinedPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dailyRoutines: any[];
  onApplyPlan: (planExercises: any[], targetDayId: string) => Promise<void>;
}

const predefinedPlans = [
  {
    id: 'push',
    name: 'Push Workout',
    description: 'Chest, Shoulders, Triceps',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, rest: 90 },
      { name: 'Shoulder Press', sets: 3, reps: 10, rest: 60 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 12, rest: 60 },
      { name: 'Lateral Raises', sets: 3, reps: 15, rest: 45 },
      { name: 'Tricep Dips', sets: 3, reps: 12, rest: 60 }
    ]
  },
  {
    id: 'pull',
    name: 'Pull Workout',
    description: 'Back, Biceps',
    exercises: [
      { name: 'Pull-ups', sets: 4, reps: 8, rest: 90 },
      { name: 'Barbell Rows', sets: 4, reps: 10, rest: 60 },
      { name: 'Lat Pulldown', sets: 3, reps: 12, rest: 60 },
      { name: 'Face Pulls', sets: 3, reps: 15, rest: 45 },
      { name: 'Barbell Curls', sets: 3, reps: 12, rest: 60 }
    ]
  },
  {
    id: 'legs',
    name: 'Leg Workout',
    description: 'Quads, Hamstrings, Glutes',
    exercises: [
      { name: 'Squats', sets: 4, reps: 8, rest: 120 },
      { name: 'Romanian Deadlifts', sets: 4, reps: 10, rest: 90 },
      { name: 'Leg Press', sets: 3, reps: 12, rest: 60 },
      { name: 'Leg Curls', sets: 3, reps: 12, rest: 60 },
      { name: 'Calf Raises', sets: 4, reps: 15, rest: 45 }
    ]
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    description: 'Complete workout',
    exercises: [
      { name: 'Squats', sets: 3, reps: 10, rest: 90 },
      { name: 'Bench Press', sets: 3, reps: 10, rest: 90 },
      { name: 'Barbell Rows', sets: 3, reps: 10, rest: 60 },
      { name: 'Shoulder Press', sets: 3, reps: 10, rest: 60 },
      { name: 'Deadlifts', sets: 3, reps: 8, rest: 120 }
    ]
  }
];

export function PredefinedPlansDialog({ open, onOpenChange, dailyRoutines, onApplyPlan }: PredefinedPlansDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [targetDay, setTargetDay] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!selectedPlan || !targetDay) {
      toast({
        title: "Selection Required",
        description: "Please select both a plan and a target day.",
        variant: "destructive",
      });
      return;
    }

    const plan = predefinedPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setLoading(true);
    try {
      await onApplyPlan(plan.exercises, targetDay);
      toast({
        title: "Success",
        description: `${plan.name} has been applied to your routine!`,
      });
      onOpenChange(false);
      setSelectedPlan('');
      setTargetDay('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = predefinedPlans.find(p => p.id === selectedPlan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Apply Predefined Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Workout Plan</Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-background">
                {predefinedPlans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - {plan.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlanData && (
            <Card className="bg-muted">
              <CardContent className="pt-4 space-y-2">
                <p className="text-sm font-medium">{selectedPlanData.name}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {selectedPlanData.exercises.map((ex, idx) => (
                    <li key={idx}>• {ex.name} - {ex.sets}x{ex.reps}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label>Apply to Daily Routine</Label>
            <Select value={targetDay} onValueChange={setTargetDay}>
              <SelectTrigger>
                <SelectValue placeholder="Select target day" />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-background">
                {dailyRoutines.map((day: any) => (
                  <SelectItem key={day.id} value={day.id}>
                    {day.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              className="flex-1"
              disabled={loading || !selectedPlan || !targetDay}
            >
              {loading ? 'Applying...' : 'Apply Plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
