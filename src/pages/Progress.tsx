import { useState, useEffect } from 'react';
import { Calendar, Download, BarChart3, TrendingUp, CalendarDays, Dumbbell, Flame, ChevronLeft, ChevronRight, Activity, Scale, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Progress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [routineCount, setRoutineCount] = useState(0);
  const [completedWorkoutDates, setCompletedWorkoutDates] = useState<Date[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [caloriesData, setCaloriesData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [weekOffset, setWeekOffset] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProgressData();
      fetchWeightHistory();
    }
  }, [user, weekOffset]);

  const getWeekDates = (offset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - (offset * 7));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const fetchWeightHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weight_history')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true })
        .limit(30);

      if (error) throw error;

      if (data && data.length > 0) {
        const chartData = data.map(entry => ({
          date: new Date(entry.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: parseFloat(entry.weight_kg.toString())
        }));
        setWeightData(chartData);
        setCurrentWeight(parseFloat(data[data.length - 1].weight_kg.toString()));
      }
    } catch (error) {
      console.error('Error fetching weight history:', error);
    }
  };

  const handleAddWeight = async () => {
    if (!user || !newWeight) return;

    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      toast({ title: "Invalid weight", description: "Please enter a valid weight.", variant: "destructive" });
      return;
    }

    setSavingWeight(true);
    try {
      const { error } = await supabase
        .from('weight_history')
        .insert({
          user_id: user.id,
          weight_kg: weight,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;

      // Also update profile weight
      await supabase
        .from('profiles')
        .update({ weight_kg: weight, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      toast({ title: "Weight recorded!", description: `${weight} kg has been saved.` });
      setShowWeightDialog(false);
      setNewWeight('');
      fetchWeightHistory();
    } catch (error) {
      console.error('Error saving weight:', error);
      toast({ title: "Error", description: "Failed to save weight.", variant: "destructive" });
    } finally {
      setSavingWeight(false);
    }
  };

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      const { data: workouts, error: workoutError } = await supabase
        .from('workouts')
        .select(`
          id, 
          completed_at, 
          total_duration_minutes,
          calories_burned,
          workout_exercises (
            id,
            sets_completed,
            actual_reps,
            actual_weight_kg,
            actual_duration_seconds,
            exercises (
              exercise_type
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (workoutError) throw workoutError;

      setWorkoutCount(workouts?.length || 0);

      const { data: routines, error: routineError } = await supabase
        .from('workout_routines')
        .select('id')
        .eq('user_id', user.id);

      if (routineError) throw routineError;
      setRoutineCount(routines?.length || 0);

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

        const weekDates = getWeekDates(weekOffset);

        const chartData = weekDates.map(date => {
          const dayWorkouts = workouts.filter(
            w => new Date(w.completed_at).toDateString() === date.toDateString()
          );
          
          let dayCalories = 0;
          dayWorkouts.forEach(workout => {
            if (workout.calories_burned) {
              dayCalories += workout.calories_burned;
            } else if (workout.total_duration_minutes) {
              const exerciseTypes = workout.workout_exercises?.map(
                (we: any) => we.exercises?.exercise_type
              ).filter(Boolean) || [];
              
              const avgCaloriesPerMin = exerciseTypes.length > 0
                ? exerciseTypes.reduce((sum: number, type: string) => {
                    const rates: { [key: string]: number } = { weights: 5, bodyweight: 6, cardio: 10, flexibility: 3, other: 5 };
                    return sum + (rates[type] || 5);
                  }, 0) / exerciseTypes.length
                : 5;
              
              dayCalories += Math.round(workout.total_duration_minutes * avgCaloriesPerMin);
            }
          });

          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            workouts: dayWorkouts.length,
            calories: dayCalories
          };
        });

        setWeeklyData(chartData);
        setCaloriesData(chartData);
        
        const weekTotal = chartData.reduce((sum, day) => sum + day.calories, 0);
        setTotalCalories(weekTotal);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekLabel = () => {
    const weekDates = getWeekDates(weekOffset);
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === 1) return 'Last Week';
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const exportPDF = async () => {
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });

      pdf.setFontSize(20);
      pdf.text('Fitness Progress Report', 40, 60);

      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 80);
      pdf.text(`Week: ${getWeekLabel()}`, 40, 100);

      pdf.setFontSize(14);
      pdf.text('Statistics:', 40, 130);

      pdf.setFontSize(12);
      pdf.text(`Total Workouts Completed: ${workoutCount}`, 50, 150);
      pdf.text(`Current Streak: ${currentStreak} days`, 50, 170);
      pdf.text(`Total Routines Created: ${routineCount}`, 50, 190);
      pdf.text(`Weekly Calories Burned: ${totalCalories} cal`, 50, 210);
      if (currentWeight) {
        pdf.text(`Current Weight: ${currentWeight} kg`, 50, 230);
      }

      if (caloriesData.length > 0) {
        pdf.text('Daily Breakdown:', 40, 260);
        caloriesData.forEach((day, index) => {
          pdf.text(`${day.fullDate}: ${day.workouts} workout(s), ${day.calories} calories`, 50, 280 + (index * 20));
        });
      }

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
    }
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

      {/* Week Navigation */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setWeekOffset(prev => prev + 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="font-medium text-sm">{getWeekLabel()}</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
            disabled={weekOffset === 0}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-premium">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Total Workouts</p>
                  <p className="text-lg font-bold">{loading ? '...' : workoutCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-premium">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-lg font-bold">{loading ? '...' : currentStreak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-warning" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Week Calories</p>
                  <p className="text-lg font-bold">{loading ? '...' : totalCalories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-info/10 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-info" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-lg font-bold">{currentWeight ? `${currentWeight} kg` : '--'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <CalendarDays className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Workout Calendar</DialogTitle>
                <DialogDescription>
                  Highlighted dates show completed workouts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ workout: completedWorkoutDates }}
                  modifiersStyles={{
                    workout: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                  }}
                  className="rounded-md border p-3 pointer-events-auto"
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showWeightDialog} onOpenChange={setShowWeightDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Log Weight
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Body Weight</DialogTitle>
                <DialogDescription>
                  Track your weight progress over time
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Enter your weight"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowWeightDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleAddWeight} disabled={savingWeight}>
                    {savingWeight ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Empty State */}
        {workoutCount === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">No Progress Data Yet</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Complete your first workout to start seeing your progress analytics
              </p>
            </div>

            <Button variant="outline" className="w-full max-w-xs" onClick={() => navigate('/workouts')}>
              <Dumbbell className="w-4 h-4 mr-2" />
              Start Your First Workout
            </Button>
          </div>
        )}

        {/* Weight Tracking Chart */}
        {weightData.length > 0 && (
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Scale className="w-5 h-5 text-info" />
                <span>Body Weight Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [`${value} kg`, 'Weight']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--info))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--info))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Weekly Progress Chart */}
        {workoutCount > 0 && weeklyData.length > 0 && (
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Dumbbell className="w-5 h-5 text-primary" />
                <span>Weekly Workouts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [`${value} workout(s)`, 'Count']}
                  />
                  <Bar 
                    dataKey="workouts" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Calories Chart */}
        {workoutCount > 0 && caloriesData.length > 0 && (
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Flame className="w-5 h-5 text-warning" />
                <span>Daily Calories Burned</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={caloriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [`${value} cal`, 'Calories']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--warning))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Breakdown */}
        {workoutCount > 0 && caloriesData.length > 0 && (
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Activity className="w-5 h-5 text-info" />
                <span>Daily Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {caloriesData.map((day, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-20">{day.fullDate}</span>
                      <span className="text-xs text-muted-foreground">
                        {day.workouts} workout{day.workouts !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-warning">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-medium">{day.calories} cal</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Progress;
