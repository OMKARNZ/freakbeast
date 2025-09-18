import { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState([]);
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: '',
    target_value: '',
    unit: '',
    target_date: ''
  });

  const fetchGoals = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return;
    }

    setGoals(data || []);
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('fitness_goals')
      .insert([{
        ...formData,
        user_id: user.id,
        goal_type: formData.goal_type as any,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        target_date: formData.target_date || null
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Goal created successfully!",
    });

    setFormData({
      title: '',
      description: '',
      goal_type: '',
      target_value: '',
      unit: '',
      target_date: ''
    });
    setShowNewGoalDialog(false);
    fetchGoals();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold">Fitness Goals</h1>
        <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Lose 10 kg"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal_type">Goal Type</Label>
                <Select value={formData.goal_type} onValueChange={(value) => setFormData({...formData, goal_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="weight_gain">Weight Gain</SelectItem>
                    <SelectItem value="muscle_building">Muscle Building</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="general_fitness">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="target_value">Target Value</Label>
                  <Input
                    id="target_value"
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="kg, lbs, reps"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your goal..."
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowNewGoalDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Goal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {goals.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-card rounded-full flex items-center justify-center shadow-card">
                <Target className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Set Your First Goal</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Define clear fitness objectives to stay motivated and track your progress
              </p>
            </div>

            <Button className="w-full max-w-xs" onClick={() => setShowNewGoalDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </div>
        ) : (
          /* Goals List */
          <div className="space-y-4">
            {goals.map((goal: any) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge variant={goal.status === 'active' ? 'default' : goal.status === 'completed' ? 'secondary' : 'outline'}>
                      {goal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {goal.target_value && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.current_value || 0}/{goal.target_value} {goal.unit}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${Math.min(((goal.current_value || 0) / goal.target_value) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                    {goal.target_date && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    )}
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;