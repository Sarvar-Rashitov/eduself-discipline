import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CheckSquare, Timer, Flame, TrendingUp, Calendar as CalendarIcon, Edit2, Check } from 'lucide-react';
import { getRandomQuote } from '../lib/quotes';
import { Link } from 'react-router';
import { format, startOfWeek, addDays, isToday } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { tasks, pomodoroSessions, habits, settings, setSettings } = useApp();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(settings.userName);
  const [quote] = useState(getRandomQuote());

  const today = new Date().toISOString().split('T')[0];
  
  // Calculate stats
  const todayTasks = tasks.filter(t => t.section === 'today');
  const completedTodayTasks = todayTasks.filter(t => t.completed);
  const taskProgress = todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 100 : 0;

  const pomodorosToday = pomodoroSessions.filter(
    p => p.completedAt?.startsWith(today) && p.type === 'focus'
  ).length;

  const totalFocusTime = pomodoroSessions
    .filter(p => p.completedAt?.startsWith(today) && p.type === 'focus')
    .reduce((acc, p) => acc + p.duration, 0);
  const focusHours = Math.floor(totalFocusTime / 3600);
  const focusMinutes = Math.floor((totalFocusTime % 3600) / 60);

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasActivity = 
        tasks.some(t => t.completed && t.createdAt?.startsWith(dateStr)) ||
        pomodoroSessions.some(p => p.completedAt?.startsWith(dateStr)) ||
        habits.some(h => h.completedDates.includes(dateStr));
      
      if (hasActivity) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  const topTasks = tasks
    .filter(t => !t.completed && t.section === 'today')
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSaveName = () => {
    setSettings({ ...settings, userName: nameInput });
    setEditingName(false);
  };

  // Get current week for mini calendar
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="text-3xl font-bold h-12"
                autoFocus
              />
              <Button size="icon" onClick={handleSaveName}>
                <Check className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">
                {getGreeting()}, {settings.userName}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingName(true)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <p className="text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-2 hover:border-primary transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <span className="text-3xl font-bold text-primary">{streak}</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Day Streak</p>
        </Card>

        <Card className="p-6 border-2 hover:border-success transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <CheckSquare className="h-6 w-6 text-success" />
            </div>
            <span className="text-3xl font-bold text-success">
              {completedTodayTasks.length}
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
        </Card>

        <Card className="p-6 border-2 hover:border-warning transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning/10 rounded-xl">
              <Timer className="h-6 w-6 text-warning" />
            </div>
            <span className="text-3xl font-bold text-warning">{pomodorosToday}</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Pomodoros</p>
        </Card>

        <Card className="p-6 border-2 hover:border-chart-4 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-chart-4/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-chart-4" />
            </div>
            <span className="text-2xl font-bold text-chart-4">
              {focusHours}h {focusMinutes}m
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Focus Time</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Progress */}
          <Card className="p-6">
            <h2 className="font-bold text-xl mb-4">Daily Progress</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tasks Completed</span>
                <span className="font-medium">
                  {completedTodayTasks.length} / {todayTasks.length}
                </span>
              </div>
              <Progress value={taskProgress} className="h-3" />
            </div>
          </Card>

          {/* Today's Focus */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl">Today's Focus</h2>
              <Link to="/tasks">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>

            {topTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No tasks for today. Great job!</p>
                <Link to="/tasks">
                  <Button variant="outline" size="sm" className="mt-3">
                    Add a Task
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {topTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className={`w-1 h-full rounded-full ${
                      task.priority === 'high' ? 'bg-destructive' :
                      task.priority === 'medium' ? 'bg-warning' :
                      'bg-success'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-muted px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Motivational Quote */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="text-4xl">"</div>
              <div>
                <p className="text-lg italic mb-2">{quote}</p>
                <p className="text-sm text-muted-foreground">— Keep pushing forward</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h3 className="font-bold">This Week</h3>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`text-center rounded-lg p-2 ${
                    isToday(day)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-xs font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {completedTodayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-muted-foreground flex-1">
                    Completed "{task.title}"
                  </span>
                </div>
              ))}
              {pomodorosToday > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <span className="text-muted-foreground flex-1">
                    Completed {pomodorosToday} Pomodoro session{pomodorosToday > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {completedTodayTasks.length === 0 && pomodorosToday === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No activity yet today
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
