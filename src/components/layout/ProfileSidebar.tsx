import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface ProfileSidebarProps {
  stats: {
    workouts: number;
    streak: number;
    goals: number;
  };
}

const ProfileSidebar = ({ stats }: ProfileSidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .single();
    if (data) setProfile(data);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <Card className="card-premium">
      <CardContent className="p-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-base font-semibold">{displayName}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Workouts</p>
            <p className="text-lg font-bold">{stats.workouts}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="text-lg font-bold">{stats.streak}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Goals</p>
            <p className="text-lg font-bold">{stats.goals}</p>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/profile')}
        >
          See your profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
