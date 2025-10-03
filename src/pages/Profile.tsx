import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, BarChart3, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BMIDialog } from '@/components/BMIDialog';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showBMIDialog, setShowBMIDialog] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ workouts: 0, goals: 0 });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setProfile(data);
  };

  const fetchStats = async () => {
    if (!user) return;

    const { data: workoutsData } = await supabase
      .from('workouts')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    const { data: goalsData } = await supabase
      .from('fitness_goals')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    setStats({
      workouts: workoutsData?.length || 0,
      goals: goalsData?.length || 0
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-lg sm:text-xl font-bold">Profile</h1>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/progress')}>
            <BarChart3 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* User Info Card */}
        <Card className="bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-muted text-2xl">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center space-y-2">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {profile?.full_name || user?.user_metadata?.full_name || 'Anonymous user'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {user?.email}
                </p>
              </div>

              {profile?.bmi && (
                <div className="flex items-center justify-center gap-4 p-3 bg-muted rounded-lg w-full">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">BMI</p>
                    <p className="text-lg font-bold">{profile.bmi}</p>
                  </div>
                  {profile.weight_kg && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="text-lg font-bold">{profile.weight_kg} kg</p>
                    </div>
                  )}
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowBMIDialog(true)}
                className="w-full sm:w-auto"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {profile?.bmi ? 'Update BMI' : 'Calculate BMI'}
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-1">
                <p className="text-xl sm:text-2xl font-bold text-primary">{stats.workouts}</p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-1">
                <p className="text-xl sm:text-2xl font-bold text-primary">{stats.goals}</p>
                <p className="text-xs text-muted-foreground">Goals</p>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Sign Out */}
        <div className="pt-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <BMIDialog open={showBMIDialog} onOpenChange={setShowBMIDialog} />
    </div>
  );
};

export default Profile;