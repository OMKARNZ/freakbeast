import { Calendar, Download, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Progress = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold">Progress Reports</h1>
        <Button variant="outline" size="sm">
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
                  <p className="text-lg font-bold">0</p>
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
                  <p className="text-lg font-bold">0 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
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

          <Button variant="outline" className="w-full max-w-xs">
            <Calendar className="w-4 h-4 mr-2" />
            View Workout Calendar
          </Button>
        </div>

        {/* Sample Chart Placeholder */}
        <Card className="hidden">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Chart will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;