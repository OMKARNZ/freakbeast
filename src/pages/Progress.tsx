import { useState, useEffect } from 'react';
import { Calendar, Download, BarChart3, TrendingUp, CalendarDays, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

const Progress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [routineCount, setRoutineCount] = useState(0);
  const [completedWorkoutDates, setCompletedWorkoutDates] = useState<Date[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      // Fetch completed workouts count
      const { data: workouts, error: workoutError } = await supabase
        .from('workouts')
        .select('id, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (workoutError) throw workoutError;

      setWorkoutCount(workouts?.length || 0);

      // Fetch routines count
      const { data: routines, error: routineError } = await supabase
        .from('workout_routines')
        .select('id')
        .eq('user_id', user.id);

      if (routineError) throw routineError;
      setRoutineCount(routines?.length || 0);

      // Calculate streak and workout dates
      if (workouts && workouts.length > 0) {
        const completedDates = workouts
          .map(w => new Date(w.completed_at))
          .filter(date => !isNaN(date.getTime()))
          .sort((a, b) => a.getTime() - b.getTime());
        
        setCompletedWorkoutDates(completedDates);
        
        const uniqueDateStrings = [...new Set(completedDates.map(d => d.toDateString()))];
        let streak = 0;
        const today = new Date();
        
        for (let i = uniqueDateStrings.length - 1; i >= 0; i--) {
          const date = new Date(uniqueDateStrings[i]);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - streak);
          
          if (date.toDateString() === expectedDate.toDateString()) {
            streak++;
          } else {
            break;
          }
        }
        
        setCurrentStreak(streak);

        // Generate weekly data for graph
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });

        const chartData = last7Days.map(date => {
          const dayWorkouts = completedDates.filter(
            d => d.toDateString() === date.toDateString()
          ).length;
          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            workouts: dayWorkouts
          };
        });

        setWeeklyData(chartData);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });

      pdf.setFontSize(20);
      pdf.text('Fitness Progress Report', 40, 60);

      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 80);

      pdf.setFontSize(14);
      pdf.text('Statistics:', 40, 110);

      pdf.setFontSize(12);
      pdf.text(`Total Workouts Completed: ${workoutCount}`, 50, 130);
      pdf.text(`Current Streak: ${currentStreak} days`, 50, 150);
      pdf.text(`Total Routines Created: ${routineCount}`, 50, 170);

      if (completedWorkoutDates.length > 0) {
        pdf.text('Recent Workout Dates:', 40, 200);
        const recentWorkouts = completedWorkoutDates
          .slice(-10)
          .map(date => date.toLocaleDateString())
          .join(', ');
        const lines = pdf.splitTextToSize(recentWorkouts, 500);
        pdf.text(lines, 50, 220);
      }

      // Mobile-friendly download
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fitness-progress-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export PDF', e);
      // no toast hook here; log only
    }
  };

  const isWorkoutDate = (date: Date) => {
    return completedWorkoutDates.some(workoutDate => 
      workoutDate.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold">Progress Reports</h1>
        <Button variant="outline" size="sm" onClick={exportPDF}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex space-x-4">
          <Select defaultValue="week">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Workouts</p>
                  <p className="text-lg font-bold">{loading ? '...' : workoutCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-lg font-bold">{loading ? '...' : currentStreak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Routines Created</p>
                    <p className="text-lg font-bold">{loading ? '...' : routineCount}</p>
                  </div>
                </div>
                <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      View Calendar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Workout Calendar</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{
                          workout: completedWorkoutDates
                        }}
                        modifiersStyles={{
                          workout: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                        }}
                        className="rounded-md border p-3 pointer-events-auto"
                      />
                      <p className="text-sm text-muted-foreground text-center">
                        Highlighted dates show completed workouts
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {workoutCount === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-card rounded-full flex items-center justify-center shadow-card">
                <BarChart3 className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">No Progress Data Yet</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Complete your first workout to start seeing your progress analytics
              </p>
            </div>

            <Button variant="outline" className="w-full max-w-xs" onClick={() => navigate('/workouts')}>
              <Calendar className="w-4 h-4 mr-2" />
              Start Your First Workout
            </Button>
          </div>
        )}

        {/* Weekly Progress Chart */}
        {workoutCount > 0 && weeklyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dumbbell className="w-5 h-5" />
                <span>Weekly Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="workouts" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Progress;