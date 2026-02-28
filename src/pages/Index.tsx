import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Target, TrendingUp, Clock, User, ArrowRight, Flame, Download, UserPlus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProfileSidebar from '@/components/ProfileSidebar';
import Layout from '@/components/Layout';

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
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);

  useEffect(() => {
    if (user) {
      // Fetch profile and workout data in parallel
      Promise.all([fetchProfile(), fetchUserData()]).finally(() => setLoadingData(false));
    } else {
      setLoadingData(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setProfile(data);
  };

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const [workoutsRes, goalsRes] = await Promise.all([
        supabase
          .from('workouts')
          .select('id, name, completed_at, total_duration_minutes, calories_burned')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5),
        supabase
          .from('fitness_goals')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
      ]);

      const workouts = workoutsRes.data;
      const goals = goalsRes.data;

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
    }
  };

  // Guest View (Not Logged In)
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Guest Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">FreakBeast</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button className="btn-gradient" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="hero-gradient min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center space-y-6 animate-fade-in max-w-2xl">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg glow-primary">
                <Dumbbell className="w-10 h-10 text-primary-foreground" />
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
        <div className="px-4 py-16 space-y-8 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center">Why FreakBeast?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-premium text-center p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Custom Workouts</h3>
              <p className="text-sm text-muted-foreground">
                Create personalized workout routines with predefined plans
              </p>
            </Card>
            <Card className="card-premium text-center p-6">
              <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Goal Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Set fitness goals and track your progress over time
              </p>
            </Card>
            <Card className="card-premium text-center p-6">
              <div className="w-14 h-14 bg-info/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-info" />
              </div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                View detailed progress reports and calorie tracking
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-4 py-16 bg-muted/50">
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

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  // Logged In Dashboard View
  return (
    <Layout>
      <div className="min-h-screen bg-background animate-fade-in">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Page Title */}
          <h1 className="text-2xl font-bold mb-8">Home</h1>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Welcome Card */}
              <Card className="card-premium overflow-hidden">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-3">
                      <h2 className="text-xl lg:text-2xl font-bold">
                        Hello <span className="text-primary">{displayName}</span>, welcome to FreakBeast!
                      </h2>
                      <p className="text-muted-foreground">
                        To take full advantage of FreakBeast complete the following steps:
                      </p>
                    </div>
                    <div className="hidden lg:block w-40 h-32 bg-muted/50 rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-16 h-16 text-primary/30" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Steps */}
              <div className="space-y-4">
                {/* Step 1: Create Routine */}
                <Card 
                  className="card-premium cursor-pointer hover:border-primary/50"
                  onClick={() => navigate('/workouts')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">Create your first workout routine</p>
                      <p className="text-sm text-muted-foreground">
                        Set up a personalized routine to track your progress
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>

                {/* Step 2: Complete Profile */}
                <Card 
                  className="card-premium cursor-pointer hover:border-primary/50"
                  onClick={() => navigate('/profile')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">Complete your profile</p>
                      <p className="text-sm text-muted-foreground">
                        Add your details to get personalized recommendations
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>

                {/* Step 3: Set Goals */}
                <Card 
                  className="card-premium cursor-pointer hover:border-primary/50"
                  onClick={() => navigate('/goals')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">Set your fitness goals</p>
                      <p className="text-sm text-muted-foreground">
                        Define what you want to achieve and track your journey
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
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
                        <CardContent className="py-4 px-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Dumbbell className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{workout.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(workout.completed_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              {workout.total_duration_minutes && (
                                <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                                  <Clock className="w-4 h-4" />
                                  {workout.total_duration_minutes}min
                                </p>
                              )}
                              {workout.calories_burned && (
                                <p className="text-sm text-warning flex items-center justify-end gap-1">
                                  <Flame className="w-4 h-4" />
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

            {/* Right Sidebar - Profile */}
            <div className="w-full xl:w-80 flex-shrink-0">
              <ProfileSidebar stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
