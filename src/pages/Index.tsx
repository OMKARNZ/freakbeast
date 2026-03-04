import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Target, TrendingUp, Clock, User, ArrowRight, Flame, Download, UserPlus, BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProfileSidebar from '@/components/layout/ProfileSidebar';
import Layout from '@/components/layout/Layout';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    workouts: 0,
    streak: 0,
    goals: 0,
    caloriesBurned: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setProfile(data);
  }, [user]);

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      const [workoutsRes, goalsRes] = await Promise.all([
        supabase
          .from('workouts')
          .select('id, name, completed_at, total_duration_minutes, calories_burned')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(10), // Increased slightly for better streak accuracy
        supabase
          .from('fitness_goals')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
      ]);

      const workouts = workoutsRes.data;
      const goals = goalsRes.data;

      if (workouts && workouts.length > 0) {
        // Optimize streak calculation with Set and fast Date parsing
        const completedDateStrings = [...new Set(
          workouts
            .map(w => new Date(w.completed_at).toDateString())
            .filter(d => d !== "Invalid Date")
        )];

        let localStreak = 0;
        const current = new Date();

        for (const dateString of completedDateStrings) {
          const expected = new Date(current);
          expected.setDate(expected.getDate() - localStreak);

          if (dateString === expected.toDateString()) {
            localStreak++;
          } else {
            break;
          }
        }

        const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

        setStats({
          workouts: workouts.length,
          streak: localStreak,
          goals: goals?.length || 0,
          caloriesBurned: totalCalories
        });

        setRecentWorkouts(workouts.slice(0, 3));
      } else {
        setStats({ workouts: 0, streak: 0, goals: goals?.length || 0, caloriesBurned: 0 });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      Promise.all([fetchProfile(), fetchUserData()]).finally(() => setLoadingData(false));
    } else {
      setLoadingData(false);
    }
  }, [user, fetchProfile, fetchUserData]);

  // Guest View (Not Logged In)
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-[#ffeadb]">

        {/* Navigation */}
        <header className={`absolute w-full top-0 z-50 transition-all duration-300 ${isMobileMenuOpen ? 'backdrop-blur-none px-0' : 'px-6'}`}>
          <div className="max-w-7xl mx-auto py-8 lg:px-6 flex items-center justify-between relative z-50">
            <Link to="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${isMobileMenuOpen ? 'ml-6' : ''}`}>
              <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white font-bold text-xl drop-shadow-md">
                fb.
              </div>
            </Link>

            {/* Desktop Navbar */}
            <nav className="hidden md:flex items-center gap-10 text-xs font-bold tracking-[0.15em] text-[#1a1a1a]">
              <Link to="/" className="hover:text-[#f97316] transition-colors">HOME</Link>
              <Link to="/about" className="hover:text-[#f97316] transition-colors">ABOUT</Link>
              <a href="#features" className="hover:text-[#f97316] transition-colors">FEATURES</a>
              <a href="#contact" className="hover:text-[#f97316] transition-colors">CONTACT</a>
            </nav>

            {/* Mobile Menu Toggle */}
            <div className={`md:hidden flex items-center ${isMobileMenuOpen ? 'mr-6' : ''}`}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#1a1a1a] focus:outline-none p-2 rounded-full hover:bg-gray-200 transition-colors bg-white/50 backdrop-blur-md"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navbar Overlay */}
          <div className={`
            fixed inset-0 bg-[#f8f9fa] z-40 flex flex-col items-center justify-center
            transition-all duration-500 ease-in-out md:hidden
            ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-10'}
          `}>
            <nav className="flex flex-col items-center gap-8 text-lg font-black tracking-[0.2em] text-[#1a1a1a]">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#f97316] transition-colors">HOME</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#f97316] transition-colors">ABOUT</Link>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#f97316] transition-colors">FEATURES</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#f97316] transition-colors">CONTACT</a>
              <Button
                onClick={() => { setIsMobileMenuOpen(false); navigate('/auth'); }}
                className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full px-8 py-4 mt-6 text-xs font-bold tracking-[0.15em] uppercase shadow-[0_8px_20px_rgba(249,115,22,0.3)] transition-all h-auto"
              >
                Log In
              </Button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-24 pb-12">
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between relative z-10">
            {/* Left Column */}
            <div className="flex-1 space-y-6 md:pr-10 text-center md:text-left z-20 mt-10 md:mt-0">
              <p className="text-[#f97316] font-bold tracking-[0.25em] text-sm uppercase drop-shadow-sm">
                Let's do something
              </p>
              <h1 className="text-[5.5rem] md:text-[7rem] lg:text-[9rem] font-black text-[#1a1a1a] tracking-tighter leading-[0.9] mb-8">
                Beast.
              </h1>
              <div className="flex flex-row items-center justify-center md:justify-start gap-4 pt-6">
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full px-12 py-7 mt-4 text-xs font-bold tracking-[0.15em] uppercase shadow-[0_8px_20px_rgba(249,115,22,0.3)] transition-all hover:-translate-y-1 h-auto"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Right Column / Graphic */}
            <div className="flex-1 relative w-full h-[400px] md:h-[600px] mt-16 md:mt-0 flex justify-center items-center pointer-events-none">
              {/* Decorative abstract elements */}
              <div className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
              <div className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-orange-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse translate-x-10 translate-y-10" style={{ animationDelay: '2s' }}></div>

              <div className="relative z-10 w-full h-full flex items-center justify-center drop-shadow-2xl hover:drop-shadow-[0_35px_35px_rgba(249,115,22,0.15)] transition-all duration-700 mt-10">
                {/* Desktop Mockup */}
                <img
                  src="/desktop-mockup.png"
                  alt="Desktop App Preview"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-[85%] rounded-lg border border-gray-100/50 shadow-2xl"
                />

                {/* Phone Mockup Floating */}
                <img
                  src="/phone-mockup.png"
                  alt="Mobile App Preview"
                  className="absolute left-0 lg:-left-10 top-1/2 -translate-y-[45%] w-[40%] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] animate-bounce"
                  style={{ animationDuration: '4s' }}
                />

                {/* Floating Badges */}
                <div className="absolute top-1/4 right-0 bg-white/95 backdrop-blur-md border border-gray-100 px-5 py-3 rounded-full flex items-center gap-2 shadow-lg" style={{ animation: 'float 5s ease-in-out infinite' }}>
                  <Dumbbell className="w-4 h-4 text-[#1a1a1a]" />
                  <span className="text-xs font-bold tracking-wide text-[#1a1a1a]">Track Workouts</span>
                </div>

                <div className="absolute bottom-1/4 left-10 lg:-left-10 bg-white/95 backdrop-blur-md border border-gray-100 px-5 py-3 rounded-full flex items-center gap-2 shadow-lg" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1.5s' }}>
                  <UserPlus className="w-4 h-4 text-[#1a1a1a]" />
                  <span className="text-xs font-bold tracking-wide text-[#1a1a1a]">Community</span>
                </div>

                <div className="absolute bottom-[10%] right-[10%] bg-white/95 backdrop-blur-md border border-gray-100 px-5 py-3 rounded-full flex items-center gap-2 shadow-lg" style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '3s' }}>
                  <TrendingUp className="w-4 h-4 text-[#1a1a1a]" />
                  <span className="text-xs font-bold tracking-wide text-[#1a1a1a]">Analyze Progress</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <p className="text-[#f97316] font-bold tracking-[0.2em] text-sm uppercase">Why FreakBeast</p>
              <h2 className="text-4xl md:text-5xl font-black text-[#1a1a1a] tracking-tight">Elevate your routine.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#f8f9fa] rounded-[2rem] p-10 text-center hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm hover:shadow-xl group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-8 h-8 text-[#1a1a1a]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">Custom Workouts</h3>
                <p className="text-gray-500 leading-relaxed text-sm">Create personalized workout routines with predefined plans tailored to your goals.</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-[2rem] p-10 text-center hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm hover:shadow-xl group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-[#f97316]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">Goal Tracking</h3>
                <p className="text-gray-500 leading-relaxed text-sm">Set fitness targets and monitor your progress automatically over time.</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-[2rem] p-10 text-center hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm hover:shadow-xl group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-[#1a1a1a]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">Analytics</h3>
                <p className="text-gray-500 leading-relaxed text-sm">View detailed progress reports and track calories seamlessly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#f97316] blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          </div>
          <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">Ready to transform?</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Join thousands of users who are already crushing their fitness goals with FreakBeast.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full px-12 py-7 mt-4 text-xs font-bold tracking-[0.15em] uppercase shadow-[0_8px_20px_rgba(249,115,22,0.3)] transition-all hover:-translate-y-1 h-auto"
            >
              Start Free Trial
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="bg-white py-12 px-6 border-t border-gray-100">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white font-bold text-sm">
                fb.
              </div>
              <span className="font-bold text-[#1a1a1a] tracking-wider text-xl">FreakBeast</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold tracking-[0.15em] text-[#a0a0a0]">
              <Link to="/privacy" className="hover:text-[#f97316] transition-colors">PRIVACY</Link>
              <Link to="/terms" className="hover:text-[#f97316] transition-colors">TERMS</Link>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#f97316] transition-colors">TWITTER</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#f97316] transition-colors">INSTAGRAM</a>
            </nav>
            <p className="text-xs font-medium text-[#a0a0a0]">
              © {new Date().getFullYear()} FreakBeast. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    );
  }

  // Loading State
  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  // Logged In Dashboard View
  return (
    <Layout>
      <div className="min-h-screen bg-background animate-fade-in">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Page Title */}
          <h1 className="text-2xl font-bold mb-8">Home</h1>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Welcome Card */}
              <Card className="card-premium overflow-hidden">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-3">
                      <h2 className="text-xl lg:text-2xl font-bold">
                        Hello <span className="text-primary">{displayName}</span>, welcome to FreakBeast!
                      </h2>
                      <p className="text-muted-foreground">
                        To take full advantage of FreakBeast complete the following steps:
                      </p>
                    </div>
                    <div className="hidden lg:flex w-40 h-32 bg-muted/50 rounded-xl items-center justify-center" style={{ animation: 'float 6s ease-in-out infinite' }}>
                      <Dumbbell className="w-16 h-16 text-primary/30" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Steps */}
              <div className="space-y-4">
                {/* Step 1: Create Routine */}
                <Card
                  className="card-premium cursor-pointer hover:border-primary/50"
                  onClick={() => navigate('/workouts')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">Create your first workout routine</p>
                      <p className="text-sm text-muted-foreground">
                        Set up a personalized routine to track your progress
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>

                {/* Step 2: Complete Profile */}
                <Card
                  className="card-premium cursor-pointer hover:border-primary/50"
                  onClick={() => navigate('/profile')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">Complete your profile</p>
                      <p className="text-sm text-muted-foreground">
                        Add your details to get personalized recommendations
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>

                {/* Step 3: Set Goals */}
                <Card
                  className="card-premium cursor-pointer hover:border-primary/50"
                  onClick={() => navigate('/goals')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">Set your fitness goals</p>
                      <p className="text-sm text-muted-foreground">
                        Define what you want to achieve and track your journey
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Workouts */}
              {recentWorkouts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent Workouts</h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/progress')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {recentWorkouts.map((workout) => (
                      <Card key={workout.id} className="card-premium">
                        <CardContent className="py-4 px-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Dumbbell className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{workout.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(workout.completed_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              {workout.total_duration_minutes && (
                                <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                                  <Clock className="w-4 h-4" />
                                  {workout.total_duration_minutes}min
                                </p>
                              )}
                              {workout.calories_burned && (
                                <p className="text-sm text-warning flex items-center justify-end gap-1">
                                  <Flame className="w-4 h-4" />
                                  {workout.calories_burned} cal
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Profile */}
            <div className="w-full xl:w-80 flex-shrink-0">
              <ProfileSidebar stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
