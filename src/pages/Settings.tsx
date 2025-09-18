import { useState } from 'react';
import { Bell, Trash2, HelpCircle, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Settings = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    workoutReminders: false,
    goalNotifications: false,
    weeklySummary: true
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion with backend
    toast({
      title: "Account Deletion Requested",
      description: "Your account deletion request has been submitted. Contact support for assistance.",
    });
    setShowDeleteDialog(false);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Profile editing feature coming soon!",
    });
  };

  const handlePrivacySettings = () => {
    toast({
      title: "Privacy Settings",
      description: "Privacy settings feature coming soon!",
    });
  };

  const handleHelpCenter = () => {
    toast({
      title: "Help Center",
      description: "Help center feature coming soon!",
    });
  };

  const handleContactSupport = () => {
    toast({
      title: "Contact Support",
      description: "Support contact feature coming soon!",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="workout-reminders" className="text-sm">
                Workout Reminders
              </Label>
              <Switch 
                id="workout-reminders" 
                checked={notifications.workoutReminders}
                onCheckedChange={(checked) => handleNotificationChange('workoutReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="goal-notifications" className="text-sm">
                Goal Progress Notifications
              </Label>
              <Switch 
                id="goal-notifications" 
                checked={notifications.goalNotifications}
                onCheckedChange={(checked) => handleNotificationChange('goalNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
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

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleEditProfile}>
              <User className="w-4 h-4 mr-3" />
              Edit Profile
            </Button>
            
            <Button variant="outline" className="w-full justify-start" onClick={handlePrivacySettings}>
              <Shield className="w-4 h-4 mr-3" />
              Privacy Settings
            </Button>
            
            <Button variant="outline" className="w-full justify-start" onClick={signOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleHelpCenter}>
              <HelpCircle className="w-4 h-4 mr-3" />
              Help Center
            </Button>
            
            <Button variant="outline" className="w-full justify-start" onClick={handleContactSupport}>
              Contact Support
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
    </div>
  );
};

export default Settings;