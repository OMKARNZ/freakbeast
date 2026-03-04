import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    await signUp(email, password, fullName);
    setIsLoading(false);
  };



  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Check your email',
      description: 'Password reset link has been sent to your email.',
    });

    setShowForgotPassword(false);
    setResetEmail('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Dumbbell className="w-6 h-6 animate-pulse text-primary" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* LEFT SIDE - Auth Form */}
      <div className="auth-left">
        <div className="auth-form-container">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="auth-logo-text">FREAKBEAST</span>
          </div>

          {/* Title */}
          <h1 className="auth-title">
            {activeTab === 'signin' ? 'Log In' : 'Create Account'}
          </h1>

          {/* Form */}
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="auth-form">
              <div className="auth-field">
                <label htmlFor="signin-email" className="auth-label">
                  Email or username
                </label>
                <div className="auth-input-wrapper">
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signin-password" className="auth-label">
                  Password
                </label>
                <div className="auth-input-wrapper relative">
                  <Input
                    id="signin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    className="auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye-btn"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <div className="auth-spinner" />
                ) : (
                  'Login'
                )}
              </button>

              <button
                type="button"
                className="auth-forgot-btn"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="auth-form">
              <div className="auth-field">
                <label htmlFor="signup-name" className="auth-label">
                  Full Name
                </label>
                <div className="auth-input-wrapper">
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-email" className="auth-label">
                  Email
                </label>
                <div className="auth-input-wrapper">
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-password" className="auth-label">
                  Password
                </label>
                <div className="auth-input-wrapper relative">
                  <Input
                    id="signup-password"
                    name="password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 6 characters)"
                    required
                    minLength={6}
                    className="auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="auth-eye-btn"
                  >
                    {showSignUpPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <div className="auth-spinner" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Toggle */}
          <div className="auth-toggle">
            {activeTab === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="auth-toggle-link"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="auth-toggle-link"
                >
                  Log In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Showcase */}
      <div className="auth-right">
        {/* Decorative curved line */}
        <svg
          className="auth-curve-line"
          viewBox="0 0 400 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M200 0 C200 150, 350 200, 350 350 C350 500, 200 550, 200 600"
            stroke="url(#curveGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(207,100%,50%)" stopOpacity="0" />
              <stop offset="30%" stopColor="hsl(207,100%,50%)" stopOpacity="0.8" />
              <stop offset="70%" stopColor="hsl(207,100%,60%)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(207,100%,50%)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating gradient orbs */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        {/* Mockup images */}
        <div className="auth-mockups">
          <div className="auth-desktop-mockup animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <img
              src="/desktop-mockup.png"
              alt="FreakBeast Desktop App - workout feed and social features"
              className="auth-desktop-img"
            />
          </div>
          <div className="auth-phone-mockup animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <img
              src="/phone-mockup.png"
              alt="FreakBeast Mobile App - track your workouts"
              className="auth-phone-img"
            />
          </div>
        </div>

        {/* Floating feature badges */}
        <div className="auth-badge auth-badge-1 animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <Dumbbell className="w-4 h-4" />
          <span>Track Workouts</span>
        </div>
        <div className="auth-badge auth-badge-2 animate-fade-in" style={{ animationDelay: '1.1s' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>Analyze Progress</span>
        </div>
        <div className="auth-badge auth-badge-3 animate-fade-in" style={{ animationDelay: '1.3s' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Community</span>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowForgotPassword(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
