import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Target, TrendingUp, Clock, User, ArrowRight, Flame, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    workouts: 0,
    streak: 0,
    goals: 0,
    caloriesBurned: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoadingData(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch completed workouts
      const { data: workouts } = await supabase
        .from('workouts')
        .select('id, name, completed_at, total_duration_minutes, calories_burned')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      // Fetch goals count
      const { data: goals } = await supabase
        .from('fitness_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Calculate streak
      let streak = 0;
      if (workouts && workouts.length > 0) {
        const completedDates = workouts
          .map(w => new Date(w.completed_at))
          .filter(date => !isNaN(date.getTime()));
        
        const uniqueDateStrings = [...new Set(completedDates.map(d => d.toDateString()))];
        const today = new Date();
        
        for (let i = 0; i < uniqueDateStrings.length; i++) {
          const date = new Date(uniqueDateStrings[i]);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - streak);
          
          if (date.toDateString() === expectedDate.toDateString()) {
            streak++;
          } else {
            break;
          }
        }

        // Calculate total calories burned
        const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

        setStats({
          workouts: workouts.length,
          streak,
          goals: goals?.length || 0,
          caloriesBurned: totalCalories
        });

        setRecentWorkouts(workouts.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Guest View (Not Logged In)
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="hero-gradient min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center space-y-6 animate-fade-in max-w-2xl">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Dumbbell className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Welcome to <span className="text-gradient">FreakBeast</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Your ultimate fitness companion. Track workouts, crush goals, and transform your body.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="btn-gradient"
                onClick={() => navigate('/auth')}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-4 py-12 space-y-8">
          <h2 className="text-2xl font-bold text-center">Why FreakBeast?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="card-premium text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Custom Workouts</h3>
              <p className="text-sm text-muted-foreground">
                Create personalized workout routines with predefined plans
              </p>
            </Card>
            <Card className="card-premium text-center p-6">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Goal Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Set fitness goals and track your progress over time
              </p>
            </Card>
            <Card className="card-premium text-center p-6">
              <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                View detailed progress reports and calorie tracking
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-4 py-12 bg-muted/50">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h2 className="text-xl font-bold">Ready to Transform?</h2>
            <p className="text-muted-foreground">
              Join FreakBeast today and start your fitness journey
            </p>
            <Button 
              size="lg"
              className="btn-gradient w-full"
              onClick={() => navigate('/auth')}
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Logged In Dashboard View
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero Dashboard Header */}
      <div className="hero-gradient p-6 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-bold">Your Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="card-premium">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Workouts</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.workouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.streak} <span className="text-sm font-normal">days</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Goals</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.goals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.caloriesBurned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 sm:py-6 flex flex-col items-center space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
              onClick={() => navigate('/workouts')}
            >
              <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <span className="text-sm sm:text-base">Start Workout</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 sm:py-6 flex flex-col items-center space-y-2 hover:bg-success/5 hover:border-success/50 transition-all"
              onClick={() => navigate('/goals')}
            >
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              <span className="text-sm sm:text-base">View Goals</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 sm:py-6 flex flex-col items-center space-y-2 hover:bg-info/5 hover:border-info/50 transition-all"
              onClick={() => navigate('/progress')}
            >
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-info" />
              <span className="text-sm sm:text-base">Progress</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 sm:py-6 flex flex-col items-center space-y-2 hover:bg-muted transition-all"
              onClick={() => navigate('/profile')}
            >
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              <span className="text-sm sm:text-base">Profile</span>
            </Button>
          </div>
        </div>

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Workouts</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/progress')}>
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <Card key={workout.id} className="card-premium">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{workout.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(workout.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {workout.total_duration_minutes && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {workout.total_duration_minutes}min
                          </p>
                        )}
                        {workout.calories_burned && (
                          <p className="text-xs text-warning flex items-center">
                            <Flame className="w-3 h-3 mr-1" />
                            {workout.calories_burned} cal
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
