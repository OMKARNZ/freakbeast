import { useState, useEffect } from 'react';
import { Calendar, Download, BarChart3, TrendingUp, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Progress = () => {
  const { user } = useAuth();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedGoals, setCompletedGoals] = useState(0);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState('week');

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user, timePeriod]);

  const fetchProgressData = async () => {
    if (!user) return;

    // Get date range based on selected period
    const now = new Date();
    let startDate = new Date();
    
    switch (timePeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch completed workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false });

    if (!workoutsError && workouts) {
      setWorkoutCount(workouts.length);
      setRecentWorkouts(workouts);
      
      // Calculate streak (consecutive days with workouts)
      const today = new Date();
      let streakCount = 0;
      let currentDate = new Date(today);
      
      while (true) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayWorkouts = workouts.filter(w => {
          const workoutDate = new Date(w.completed_at);
          return workoutDate >= dayStart && workoutDate <= dayEnd;
        });
        
        if (dayWorkouts.length > 0) {
          streakCount++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      setStreak(streakCount);
    }

    // Fetch completed goals
    const { data: goals, error: goalsError } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('updated_at', startDate.toISOString());

    if (!goalsError && goals) {
      setCompletedGoals(goals.length);
    }
  };

  const getPeriodText = () => {
    switch (timePeriod) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      default: return 'This Week';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold">Progress Reports</h1>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex space-x-4">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Workouts</p>
                  <p className="text-lg font-bold">{workoutCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-lg font-bold">{streak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 lg:col-span-1">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-warning" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Goals Completed</p>
                  <p className="text-lg font-bold">{completedGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Recent Workouts ({getPeriodText()})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWorkouts.slice(0, 5).map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{workout.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">
                        {workout.total_duration_minutes}m
                      </p>
                      <div className="flex items-center text-xs text-success">
                        <Target className="w-3 h-3 mr-1" />
                        Completed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-card rounded-full flex items-center justify-center shadow-card">
                <BarChart3 className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">No Progress Data Yet</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Complete your first workout to start seeing your progress analytics
              </p>
            </div>

            <Button variant="outline" className="w-full max-w-xs">
              <Calendar className="w-4 h-4 mr-2" />
              View Workout Calendar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;