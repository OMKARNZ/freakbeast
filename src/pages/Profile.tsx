import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Settings, BarChart3, X } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <BarChart3 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
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
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-muted text-2xl">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">
                  {user?.user_metadata?.full_name || 'Anonymous user'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-primary">0</p>
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
    </div>
  );
};

export default Profile;