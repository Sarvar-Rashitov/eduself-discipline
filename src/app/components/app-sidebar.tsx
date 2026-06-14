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
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { cn } from './ui/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Timer, label: 'Pomodoro', path: '/pomodoro' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Bell, label: 'Reminders', path: '/reminders' },
  { icon: Trello, label: 'Boards', path: '/boards' },
  { icon: FileText, label: 'Notes', path: '/notes' },
  { icon: Target, label: 'Habits', path: '/habits' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function AppSidebar({ disciplineScore }: { disciplineScore: number }) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <span className="font-bold text-lg">FlowDesk</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-lg">⚡</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('flex-shrink-0', collapsed && 'hidden')}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    collapsed && 'justify-center px-2',
                    isActive && 'bg-sidebar-primary text-sidebar-primary-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Discipline Score */}
        {!collapsed && (
          <div className="bg-sidebar-accent rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Discipline Score</span>
              <span className="text-lg font-bold text-primary">{disciplineScore}</span>
            </div>
            <div className="h-2 bg-sidebar-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${disciplineScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <Button
          variant="outline"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn('w-full gap-2', collapsed && 'px-2')}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>}
        </Button>
      </div>
    </div>
  );
}
