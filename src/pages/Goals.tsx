import { Plus, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Goals = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold">Fitness Goals</h1>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-card rounded-full flex items-center justify-center shadow-card">
              <Target className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Set Your First Goal</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Define clear fitness objectives to stay motivated and track your progress
            </p>
          </div>

          <Button className="w-full max-w-xs">
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </div>

        {/* Sample Goals (hidden initially) */}
        <div className="space-y-4 hidden">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Lose 10 kg</CardTitle>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>3/10 kg</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-[30%]"></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target date: March 2024
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Goals;