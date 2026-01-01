import { useState } from 'react';
import { Bell, Trash2, HelpCircle, User, Moon, Sun, Mail, Phone, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { useTheme } from '@/contexts/ThemeContext';
import { useSoundSettings } from '@/contexts/SoundSettingsContext';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { timerSoundEnabled, toggleTimerSound, playTimerSound } = useSoundSettings();
  const [notifications, setNotifications] = useState({
    workoutReminders: false,
    goalNotifications: false,
    weeklySummary: true
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  const handleTimerSoundToggle = () => {
    toggleTimerSound();
    if (!timerSoundEnabled) {
      // Play a preview when enabling
      setTimeout(() => playTimerSound(), 100);
    }
    toast({
      title: "Settings Updated",
      description: `Timer sound ${!timerSoundEnabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      
      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      
      setShowDeleteDialog(false);
      await signOut();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`,
    });
  };


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-lg sm:text-xl font-bold">Settings</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Notifications */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label htmlFor="workout-reminders" className="text-sm">
                Workout Reminders
              </Label>
              <Switch 
                id="workout-reminders" 
                checked={notifications.workoutReminders}
                onCheckedChange={(checked) => handleNotificationChange('workoutReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label htmlFor="goal-notifications" className="text-sm">
                Goal Progress Notifications
              </Label>
              <Switch 
                id="goal-notifications" 
                checked={notifications.goalNotifications}
                onCheckedChange={(checked) => handleNotificationChange('goalNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label htmlFor="weekly-summary" className="text-sm">
                Weekly Summary
              </Label>
              <Switch 
                id="weekly-summary" 
                checked={notifications.weeklySummary}
                onCheckedChange={(checked) => handleNotificationChange('weeklySummary', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
              </div>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {timerSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span>Sound</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Workout Timer Sound</Label>
                <p className="text-xs text-muted-foreground">Play sound when starting workout timer</p>
              </div>
              <Switch 
                checked={timerSoundEnabled}
                onCheckedChange={handleTimerSoundToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/5" 
              onClick={() => setShowEditProfile(true)}
            >
              <User className="w-4 h-4 mr-3" />
              Edit Profile
            </Button>
            
            <Button variant="outline" className="w-full justify-start hover:bg-primary/5" onClick={signOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/5" 
              onClick={() => setShowHelpCenter(true)}
            >
              <HelpCircle className="w-4 h-4 mr-3" />
              Help & Contact
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              <span>Danger Zone</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-muted-foreground mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EditProfileDialog open={showEditProfile} onOpenChange={setShowEditProfile} />

      <Dialog open={showHelpCenter} onOpenChange={setShowHelpCenter}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Help & Contact</DialogTitle>
            <DialogDescription>
              Get in touch with us for support
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
              <Mail className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@freakbeast.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
              <Phone className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                Support hours: Monday - Friday, 9AM - 6PM EST
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelpCenter(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;