import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const VerificationSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Log the verification
    if (user) {
      const logVerification = async () => {
        const { error } = await supabase
          .from('user_verifications')
          .insert([{
            user_id: user.id,
            verification_type: 'email'
          }]);

        if (error) {
          console.error('Error logging verification:', error);
        }
      };

      logVerification();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Freakbeast</h1>
          </div>
          
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          
          <CardTitle className="text-xl">Email Verified Successfully!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Your account has been verified successfully. You can now return to the Freakbeast application and sign in to start your fitness journey.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Return to Freakbeast
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Welcome to Freakbeast - Track Your Fitness Journey
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationSuccess;