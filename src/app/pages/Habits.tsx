import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Plus, Flame, Trophy, Trash2 } from 'lucide-react';
import { Habit } from '../lib/storage';
import { toast } from 'sonner';
import { format, subDays, startOfDay } from 'date-fns';
import confetti from 'canvas-confetti';

export const Habits: React.FC = () => {
  const { habits, setHabits } = useApp();
  const [showDialog, setShowDialog] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    emoji: '🎯',
  });

  const EMOJIS = ['🎯', '📚', '💪', '🧘', '🏃', '💧', '🥗', '😴', '🎨', '✍️', '🧠', '🌱'];

  const handleCreateHabit = () => {
    if (!newHabit.title.trim()) return;

    const habit: Habit = {
      id: crypto.randomUUID(),
      title: newHabit.title,
      emoji: newHabit.emoji,
      completedDates: [],
      createdAt: new Date().toISOString(),
      streak: 0,
    };

    setHabits([...habits, habit]);
    setNewHabit({ title: '', emoji: '🎯' });
    setShowDialog(false);
    toast.success('Habit created!');
  };

  const handleToggleHabit = (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(date);
    
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const newDates = isCompleted
          ? h.completedDates.filter(d => d !== date)
          : [...h.completedDates, date];

        // Calculate streak
        let streak = 0;
        let currentDate = new Date();
        const sortedDates = [...newDates].sort();
        
        while (true) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (sortedDates.includes(dateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }

        return { ...h, completedDates: newDates, streak };
      }
      return h;
    });

    setHabits(updatedHabits);

    if (!isCompleted) {
      const updatedHabit = updatedHabits.find(h => h.id === habitId);
      if (updatedHabit && updatedHabit.streak > 0 && updatedHabit.streak % 7 === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(`${updatedHabit.streak} day streak! 🔥`, { duration: 3000 });
      } else {
        toast.success('Habit completed!');
      }
    }
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
    toast.success('Habit deleted');
  };

  const calculateDisciplineScore = () => {
    if (habits.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
    
    return Math.round((completedToday / habits.length) * 100);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(subDays(new Date(), i));
    }
    return days;
  };

  const last7Days = getLast7Days();
  const disciplineScore = calculateDisciplineScore();

  const badges = [
    { id: '7day', label: '7-Day Streak 🥉', threshold: 7 },
    { id: '14day', label: '14-Day Streak 🥈', threshold: 14 },
    { id: '30day', label: '30-Day Streak 🥇', threshold: 30 },
  ];

  const unlockedBadges = badges.filter(badge => 
    habits.some(h => h.streak >= badge.threshold)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discipline Tracker</h1>
          <p className="text-muted-foreground">Build consistent habits</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-5 w-5" />
          New Habit
        </Button>
      </div>

      {/* Discipline Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 border-2 border-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <span className="text-5xl font-bold text-primary">{disciplineScore}</span>
          </div>
          <p className="text-sm font-medium">Discipline Score</p>
          <Progress value={disciplineScore} className="h-2 mt-2" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning/10 rounded-xl">
              <Flame className="h-8 w-8 text-warning" />
            </div>
            <span className="text-5xl font-bold text-warning">
              {Math.max(...habits.map(h => h.streak), 0)}
            </span>
          </div>
          <p className="text-sm font-medium">Longest Streak</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <Trophy className="h-8 w-8 text-success" />
            </div>
            <span className="text-5xl font-bold text-success">
              {unlockedBadges.length}
            </span>
          </div>
          <p className="text-sm font-medium">Badges Earned</p>
        </Card>
      </div>

      {/* Badges */}
      {unlockedBadges.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Achievements Unlocked
          </h3>
          <div className="flex flex-wrap gap-3">
            {unlockedBadges.map((badge) => (
              <Badge key={badge.id} variant="outline" className="text-base py-2 px-4">
                {badge.label}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Habits */}
      {habits.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="font-bold text-lg mb-2">No habits yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first habit to start building discipline
          </p>
          <Button onClick={() => setShowDialog(true)}>
            Create Habit
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <Card key={habit.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{habit.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg">{habit.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {habit.streak > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Flame className="h-3 w-3 text-warning" />
                          {habit.streak} day streak
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {habit.completedDates.length} total completions
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteHabit(habit.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Weekly Heatmap */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Last 7 Days</div>
                <div className="grid grid-cols-7 gap-2">
                  {last7Days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isCompleted = habit.completedDates.includes(dateStr);
                    const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleToggleHabit(habit.id, dateStr)}
                        className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center p-2 ${
                          isCompleted
                            ? 'bg-success border-success text-success-foreground'
                            : isToday
                            ? 'border-primary hover:bg-primary/10'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {format(day, 'EEE')}
                        </div>
                        <div className="text-lg font-bold">
                          {format(day, 'd')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Habit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Habit Name</label>
              <Input
                value={newHabit.title}
                onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                placeholder="Read 30 minutes daily"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Emoji</label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewHabit({ ...newHabit, emoji })}
                    className={`text-3xl p-3 rounded-lg border-2 transition-colors ${
                      newHabit.emoji === emoji ? 'border-primary bg-primary/10' : 'border-transparent bg-muted'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateHabit} className="flex-1">
                Create Habit
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
