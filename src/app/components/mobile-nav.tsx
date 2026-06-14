import { Link, useLocation } from 'react-router';
import { LayoutDashboard, CheckSquare, Timer, Trello, MoreHorizontal } from 'lucide-react';
import { cn } from './ui/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Timer, label: 'Pomodoro', path: '/pomodoro' },
  { icon: Trello, label: 'Boards', path: '/boards' },
  { icon: MoreHorizontal, label: 'More', path: '/settings' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 md:hidden">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
