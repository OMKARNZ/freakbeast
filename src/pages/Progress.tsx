import { useState, useEffect } from 'react';
import { Calendar, Download, BarChart3, TrendingUp, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(20);
    pdf.text('Fitness Progress Report', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    pdf.setFontSize(14);
    pdf.text('Statistics:', 20, 65);
    
    pdf.setFontSize(12);
    pdf.text(`Total Workouts Completed: ${workoutCount}`, 30, 80);
    pdf.text(`Current Streak: ${currentStreak} days`, 30, 95);
    pdf.text(`Total Routines Created: ${routineCount}`, 30, 110);
    
    if (completedWorkoutDates.length > 0) {
      pdf.text('Recent Workout Dates:', 20, 130);
      const recentWorkouts = completedWorkoutDates
        .slice(-10)
        .map(date => date.toLocaleDateString())
        .join(', ');
      
      const lines = pdf.splitTextToSize(recentWorkouts, 170);
      pdf.text(lines, 30, 145);
    }
    
    pdf.save('fitness-progress-report.pdf');
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
                        className="rounded-md border"
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

        {/* Sample Chart Placeholder */}
        {workoutCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Chart will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Progress;