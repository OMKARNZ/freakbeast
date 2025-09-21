import { useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const VerificationSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Record the verification in the database
    if (user) {
      const recordVerification = async () => {
        await supabase
          .from('user_verifications')
          .insert([{
            user_id: user.id,
            verification_type: 'email'
          }]);
      };
      recordVerification();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <CardTitle className="text-xl">Email Verified Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Your account has been verified. You can now return to the Freakbeast application and sign in to continue your fitness journey.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Return to Freakbeast
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Welcome to Freakbeast! Start tracking your workouts and achieving your fitness goals.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationSuccess;