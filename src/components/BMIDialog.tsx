import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BMIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BMIDialog({ open, onOpenChange }: BMIDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    height_cm: '',
    weight_kg: ''
  });
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    if (open && user) {
      fetchProfile();
    }
  }, [open, user]);

  useEffect(() => {
    calculateBMI();
  }, [formData.height_cm, formData.weight_kg]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('height_cm, weight_kg, bmi')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setFormData({
        height_cm: data.height_cm?.toString() || '',
        weight_kg: data.weight_kg?.toString() || ''
      });
      if (data.bmi) {
        setBmi(data.bmi);
      }
    }
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight_kg);
    const height = parseFloat(formData.height_cm);
    
    if (!weight || !height || height === 0) {
      setBmi(null);
      setCategory('');
      return;
    }

    const heightInMeters = height / 100;
    const calculatedBMI = weight / (heightInMeters * heightInMeters);
    setBmi(parseFloat(calculatedBMI.toFixed(1)));

    // Determine BMI category
    if (calculatedBMI < 18.5) {
      setCategory('Underweight');
    } else if (calculatedBMI < 25) {
      setCategory('Normal weight');
    } else if (calculatedBMI < 30) {
      setCategory('Overweight');
    } else {
      setCategory('Obese');
    }
  };

  const handleSave = async () => {
    if (!user || !bmi) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert([
        {
          user_id: user.id,
          height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          bmi: bmi
        }
      ], { onConflict: 'user_id' });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save BMI. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "BMI information saved successfully!",
    });

    // Notify other parts of the app (e.g., Profile page) to refresh
    window.dispatchEvent(new CustomEvent('profile-updated'));

    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>BMI Calculator</DialogTitle>
          <DialogDescription>
            Calculate and track your Body Mass Index
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              placeholder="Enter your height"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              placeholder="Enter your weight"
            />
          </div>

          {bmi && (
            <Card className="bg-gradient-card">
              <CardContent className="pt-6 space-y-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
                  <p className="text-4xl font-bold text-primary">{bmi}</p>
                  <p className="text-sm text-muted-foreground mt-1">{category}</p>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• Underweight: BMI &lt; 18.5</p>
                  <p>• Normal weight: 18.5 - 24.9</p>
                  <p>• Overweight: 25 - 29.9</p>
                  <p>• Obese: BMI ≥ 30</p>
                </div>
              </CardContent>
            </Card>
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
            <Button 
              onClick={handleSave} 
              disabled={loading || !bmi}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save BMI'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
