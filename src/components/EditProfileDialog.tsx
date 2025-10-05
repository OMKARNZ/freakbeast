import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    height_cm: '',
    weight_kg: ''
  });

  useEffect(() => {
    if (open && user) {
      fetchProfile();
    }
  }, [open, user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setFormData({
        full_name: data.full_name || '',
        age: data.age?.toString() || '',
        height_cm: data.height_cm?.toString() || '',
        weight_kg: data.weight_kg?.toString() || ''
      });
    }
  };

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const weight = parseFloat(formData.weight_kg);
    const height = parseFloat(formData.height_cm);
    const bmi = calculateBMI(weight, height);

    // Update profiles table
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          full_name: formData.full_name,
          age: formData.age ? parseInt(formData.age) : null,
          height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          bmi: bmi ? parseFloat(bmi) : null
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Profile update error:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Update auth metadata for consistency
    await supabase.auth.updateUser({
      data: { full_name: formData.full_name }
    });

    setLoading(false);

    toast({
      title: "Success",
      description: "Profile updated successfully!",
    });

    // Notify Profile page to refresh
    window.dispatchEvent(new CustomEvent('profile-updated'));

    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and BMI details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Enter your age"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height_cm">Height (cm)</Label>
            <Input
              id="height_cm"
              type="number"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              placeholder="Enter your height in cm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight_kg">Weight (kg)</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.1"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              placeholder="Enter your weight in kg"
            />
          </div>
          {formData.weight_kg && formData.height_cm && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                BMI: {calculateBMI(parseFloat(formData.weight_kg), parseFloat(formData.height_cm))}
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
