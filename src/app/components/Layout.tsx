import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  Calendar, 
  Bell, 
  Trello, 
  FileText, 
  Target,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/reminders', icon: Bell, label: 'Reminders' },
  { path: '/boards', icon: Trello, label: 'Boards' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/habits', icon: Target, label: 'Habits' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const mobileNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { path: '/boards', icon: Trello, label: 'Boards' },
  { path: '/settings', icon: Settings, label: 'More' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme, tasks, habits, pomodoroSessions } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Calculate discipline score
  const calculateDisciplineScore = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Tasks completed today (0-40 points)
    const completedToday = tasks.filter(t => t.completed && t.createdAt?.startsWith(today)).length;
    const totalToday = tasks.filter(t => t.createdAt?.startsWith(today)).length;
    const taskScore = totalToday > 0 ? (completedToday / totalToday) * 40 : 0;
    
    // Pomodoro sessions today (0-30 points)
    const pomodorosToday = pomodoroSessions.filter(p => p.completedAt?.startsWith(today) && p.type === 'focus').length;
    const pomodoroScore = Math.min(pomodorosToday * 6, 30);
    
    // Habits checked today (0-30 points)
    const habitsToday = habits.filter(h => h.completedDates.includes(today)).length;
    const totalHabits = habits.length;
    const habitScore = totalHabits > 0 ? (habitsToday / totalHabits) * 30 : 0;
    
    return Math.round(taskScore + pomodoroScore + habitScore);
  };

  const disciplineScore = calculateDisciplineScore();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto bg-sidebar border-r border-sidebar-border">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-sidebar-foreground">FlowDesk</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-sidebar-accent',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-sidebar-border p-4 space-y-3">
            {/* Discipline Score */}
            <div className="bg-sidebar-accent rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-sidebar-foreground">Discipline Score</span>
                <span className="text-lg font-bold text-primary">{disciplineScore}</span>
              </div>
              <Progress value={disciplineScore} className="h-2" />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">FlowDesk</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-xl">FlowDesk</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-sidebar-accent',
                        isActive
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-sidebar-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-sidebar-border p-4 space-y-3">
                <div className="bg-sidebar-accent rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Discipline Score</span>
                    <span className="text-lg font-bold text-primary">{disciplineScore}</span>
                  </div>
                  <Progress value={disciplineScore} className="h-2" />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-full justify-start gap-2"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="h-screen overflow-auto pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};