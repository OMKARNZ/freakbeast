import { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, Calendar, Trophy, Play, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [progressValue, setProgressValue] = useState('');
  const [renameTitle, setRenameTitle] = useState('');
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

    const { data, error } = await supabase
      .from('fitness_goals')
      .insert([{
        ...formData,
        user_id: user.id,
        target_value: parseFloat(formData.target_value),
        current_value: 0,
        goal_type: formData.goal_type as any
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
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

  const handleStartGoal = async (goalId: string) => {
    const { error } = await supabase
      .from('fitness_goals')
      .update({ status: 'active' })
      .eq('id', goalId)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to start goal. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Goal Started!",
      description: "Your goal is now active. Good luck!",
    });
    
    fetchGoals();
  };

  const handleUpdateProgress = (goalId: string) => {
    const goal = goals.find((g: any) => g.id === goalId);
    setSelectedGoal(goal);
    setProgressValue(goal?.current_value?.toString() || '0');
    setShowUpdateDialog(true);
  };

  const handleSaveProgress = async () => {
    if (!selectedGoal || !progressValue) return;

    const { error } = await supabase
      .from('fitness_goals')
      .update({ 
        current_value: parseFloat(progressValue),
        status: parseFloat(progressValue) >= selectedGoal.target_value ? 'completed' : 'active'
      })
      .eq('id', selectedGoal.id)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Progress Updated!",
      description: "Your goal progress has been updated successfully.",
    });
    
    setShowUpdateDialog(false);
    setSelectedGoal(null);
    setProgressValue('');
    fetchGoals();
  };

  const handleCompleteGoal = async (goalId: string) => {
    const goal = goals.find((g: any) => g.id === goalId);
    
    const { error } = await supabase
      .from('fitness_goals')
      .update({ 
        status: 'completed',
        current_value: goal?.target_value || 0
      })
      .eq('id', goalId)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to complete goal. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Congratulations! 🎉",
      description: "You've completed your goal! Great achievement!",
    });
    
    fetchGoals();
  };

  const handleDeleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from('fitness_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Goal Deleted",
      description: "Goal has been deleted successfully.",
    });
    
    fetchGoals();
  };

  const handleRenameGoal = (goal: any) => {
    setSelectedGoal(goal);
    setRenameTitle(goal.title);
    setShowRenameDialog(true);
  };

  const handleRenameSubmit = async () => {
    if (!selectedGoal) return;
    
    if (!renameTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Goal title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('fitness_goals')
      .update({ title: renameTitle.trim() })
      .eq('id', selectedGoal.id)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to rename goal. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Goal renamed successfully!",
    });
    
    setShowRenameDialog(false);
    setSelectedGoal(null);
    setRenameTitle('');
    fetchGoals();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-2xl font-bold">Fitness Goals</h1>
        <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new fitness goal to track your progress and stay motivated.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Lose 10kg weight"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal-type">Goal Type</Label>
                <Select value={formData.goal_type} onValueChange={(value) => setFormData({...formData, goal_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent className="z-[60] bg-background">
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-value">Target Value</Label>
                  <Input
                    id="target-value"
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                    placeholder="10"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="kg, lbs, km, etc."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-date">Target Date</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                  id="goal-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your goal and motivation..."
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
      <div className="flex-1 p-4">
        {goals.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="relative mx-auto w-48 h-32">
              {/* Target illustration */}
              <div className="absolute inset-0 bg-gradient-card rounded-full shadow-card flex items-center justify-center">
                <Target className="w-16 h-16 text-primary" />
              </div>
              
              {/* Trophy illustration */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-button">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">No goals yet</h2>
              <p className="text-muted-foreground text-sm">
                Set your first fitness goal to start tracking your progress
              </p>
            </div>

            <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
              <DialogTrigger asChild>
                <Button className="w-full max-w-xs">
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>
                    Set a new fitness goal to track your progress and stay motivated.
                  </DialogDescription>
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
                      <SelectContent className="z-[60] bg-background">
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
        ) : (
          /* Goals List */
          <div className="space-y-4">
            {goals.map((goal: any) => (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          goal.status === 'completed' ? 'default' : 
                          goal.status === 'active' ? 'secondary' : 'outline'
                        }>
                          {goal.status}
                        </Badge>
                        {goal.target_date && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(goal.target_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {goal.current_value}/{goal.target_value} {goal.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((goal.current_value / goal.target_value) * 100)}% complete
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {goal.status === 'planned' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleStartGoal(goal.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start Goal
                        </Button>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleRenameGoal(goal)}
                      >
                        <Edit2 className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Rename</span>
                        <span className="sm:hidden">Rename</span>
                      </Button>
                    
                      {goal.status === 'active' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleCompleteGoal(goal.id)}
                        >
                          <Trophy className="w-4 h-4 mr-1" />
                          Mark Done
                        </Button>
                      )}

                      {goal.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleUpdateProgress(goal.id)}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Update
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rename Goal Dialog */}
        <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rename Goal</DialogTitle>
              <DialogDescription>
                Update the title of your goal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rename-title">Goal Title</Label>
                <Input
                  id="rename-title"
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  placeholder="Enter new goal title"
                  maxLength={100}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRenameSubmit();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {renameTitle.length}/100 characters
                </p>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowRenameDialog(false);
                    setRenameTitle('');
                    setSelectedGoal(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRenameSubmit} 
                  className="flex-1"
                  disabled={!renameTitle.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Update Progress Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
              <DialogDescription>
                Update your current progress towards this goal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="progress-value">
                  Current Progress ({selectedGoal?.unit})
                </Label>
                <Input
                  id="progress-value"
                  type="number"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  placeholder="Enter current progress"
                  max={selectedGoal?.target_value}
                />
                <p className="text-xs text-muted-foreground">
                  Target: {selectedGoal?.target_value} {selectedGoal?.unit}
                </p>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowUpdateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProgress} className="flex-1">
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Goals;
