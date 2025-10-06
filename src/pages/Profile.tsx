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

  useEffect(() => {
    const handler = () => {
      fetchProfile();
    };
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, []);

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
      </div>

      {/* Profile Content */}
      <div className="flex-1 space-y-6">
        {/* User Info Header - Prominent Display */}
        <div className="bg-background border-b border-border py-8">
          <div className="flex flex-col items-center space-y-3 px-4">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-primary/10">
              <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-muted">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold">
                {profile?.full_name || user?.user_metadata?.full_name || 'Anonymous user'}
              </h2>
              <p className="text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Profile Details Card */}
          {(profile?.age || profile?.weight_kg || profile?.bmi) && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  {profile?.age && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Age</p>
                      <p className="text-2xl font-bold">{profile.age}</p>
                    </div>
                  )}
                  {profile?.weight_kg && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Weight</p>
                      <p className="text-2xl font-bold">{profile.weight_kg}</p>
                      <p className="text-xs text-muted-foreground">kg</p>
                    </div>
                  )}
                  {profile?.bmi && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">BMI</p>
                      <p className="text-2xl font-bold">{profile.bmi}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowBMIDialog(true)}
            className="w-full"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {profile?.bmi ? 'Update BMI' : 'Calculate BMI'}
          </Button>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-1">
                  <p className="text-3xl font-bold text-primary">{stats.workouts}</p>
                  <p className="text-sm text-muted-foreground">Workouts</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-1">
                  <p className="text-3xl font-bold text-primary">{stats.goals}</p>
                  <p className="text-sm text-muted-foreground">Goals</p>
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
      </div>

      <BMIDialog open={showBMIDialog} onOpenChange={setShowBMIDialog} />
    </div>
  );
};

export default Profile;