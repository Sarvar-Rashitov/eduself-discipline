import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Brain, Coffee, TreePine } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { PomodoroSession } from '../lib/storage';

const AMBIENT_SOUNDS = [
  { id: 'none', label: 'None', icon: VolumeX },
  { id: 'rain', label: 'Rain 🌧️', icon: Volume2 },
  { id: 'forest', label: 'Forest 🌲', icon: Volume2 },
  { id: 'cafe', label: 'Cafe ☕', icon: Volume2 },
  { id: 'whitenoise', label: 'White Noise', icon: Volume2 },
];

export const Pomodoro: React.FC = () => {
  const { settings, pomodoroSessions, setPomodoroSessions, tasks } = useApp();
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroDurations.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedSound, setSelectedSound] = useState('none');
  const [volume, setVolume] = useState(50);
  const [linkedTaskId, setLinkedTaskId] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = mode === 'focus' 
    ? settings.pomodoroDurations.focus 
    : mode === 'shortBreak' 
    ? settings.pomodoroDurations.shortBreak 
    : settings.pomodoroDurations.longBreak;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const modeMeta = {
    focus: { label: 'Deep Focus', icon: Brain, emoji: '🧠', color: 'primary' },
    shortBreak: { label: 'Short Break', icon: Coffee, emoji: '☕', color: 'success' },
    longBreak: { label: 'Long Break', icon: TreePine, emoji: '🌿', color: 'chart-4' },
  };

  // Keyboard shortcut for Space key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && 
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsRunning(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Save session
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      type: mode,
      duration: totalTime,
      completedAt: new Date().toISOString(),
      linkedTaskId: linkedTaskId || undefined,
    };
    setPomodoroSessions([...pomodoroSessions, session]);

    // Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Notification
    if (settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('FlowDesk', {
        body: `${modeMeta[mode].label} complete! ${mode === 'focus' ? 'Time for a break.' : 'Ready to focus?'}`,
        icon: '/icon.png',
      });
    }

    toast.success(`${modeMeta[mode].label} complete! 🎉`);

    // Auto-switch
    if (mode === 'focus') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      
      if (newCount % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(settings.pomodoroDurations.longBreak);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.pomodoroDurations.shortBreak);
      }
    } else {
      setMode('focus');
      setTimeLeft(settings.pomodoroDurations.focus);
    }
  };

  const handlePlayPause = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      
      if (newCount % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(settings.pomodoroDurations.longBreak);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.pomodoroDurations.shortBreak);
      }
    } else {
      setMode('focus');
      setTimeLeft(settings.pomodoroDurations.focus);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = pomodoroSessions.filter(s => s.completedAt?.startsWith(today));
  const focusSessions = todaySessions.filter(s => s.type === 'focus');

  const incompleteTasks = tasks.filter(t => !t.completed);

  return (
    <div className="min-h-full bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Main Timer Card */}
        <Card className="p-8 lg:p-12 mb-6 border-2">
          <div className="max-w-md mx-auto">
            {/* Mode Label */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {modeMeta[mode].emoji} {modeMeta[mode].label}
              </h2>
              <p className="text-muted-foreground">Stay focused and make progress</p>
            </div>

            {/* Circular Timer */}
            <div className="relative w-80 h-80 mx-auto mb-8">
              {/* Progress Ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  className={`text-${modeMeta[mode].color}`}
                  style={{
                    strokeDasharray: 2 * Math.PI * 140,
                    strokeDashoffset: 2 * Math.PI * 140 * (1 - progress / 100),
                  }}
                  animate={{
                    filter: isRunning ? [
                      'drop-shadow(0 0 8px currentColor)',
                      'drop-shadow(0 0 16px currentColor)',
                      'drop-shadow(0 0 8px currentColor)',
                    ] : 'drop-shadow(0 0 0px currentColor)',
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </svg>

              {/* Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {Math.floor(progress)}% complete
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="h-12 w-12 rounded-full"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                onClick={handlePlayPause}
                size="lg"
                className="h-16 w-16 rounded-full"
              >
                {isRunning ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleSkip}
                className="h-12 w-12 rounded-full"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Session Dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < (sessionCount % 4) ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Task Linking */}
            {incompleteTasks.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Currently working on:</label>
                <Select value={linkedTaskId} onValueChange={setLinkedTaskId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Link to a task (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {incompleteTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ambient Sounds */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Ambient Sounds</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {AMBIENT_SOUNDS.map((sound) => (
                  <Button
                    key={sound.id}
                    variant={selectedSound === sound.id ? 'default' : 'outline'}
                    onClick={() => setSelectedSound(sound.id)}
                    className="justify-start"
                  >
                    {sound.label}
                  </Button>
                ))}
              </div>

              {selectedSound !== 'none' && (
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[volume]}
                      onValueChange={(v) => setVolume(v[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-10">{volume}%</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Today's Stats */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Today's Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Focus Sessions</span>
                  <span className="text-2xl font-bold">{focusSessions.length}</span>
                </div>
                <Progress value={(focusSessions.length / 8) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Focus Time</span>
                  <span className="text-2xl font-bold">
                    {Math.floor(focusSessions.reduce((acc, s) => acc + s.duration, 0) / 3600)}h{' '}
                    {Math.floor((focusSessions.reduce((acc, s) => acc + s.duration, 0) % 3600) / 60)}m
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Session History */}
        <Card className="p-6 mt-6">
          <h3 className="font-bold mb-4">Today's Sessions</h3>
          {todaySessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No sessions completed today. Start a Pomodoro to track your progress!
            </p>
          ) : (
            <div className="space-y-2">
              {todaySessions.slice().reverse().map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    session.type === 'focus' ? 'bg-primary' :
                    session.type === 'shortBreak' ? 'bg-success' :
                    'bg-chart-4'
                  }`} />
                  <span className="flex-1">
                    {modeMeta[session.type].emoji} {modeMeta[session.type].label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(session.completedAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.floor(session.duration / 60)}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};