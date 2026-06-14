import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function KeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if no input is focused
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // N - New task
      if (e.key === 'n' || e.key === 'N') {
        navigate('/tasks');
      }

      // P - Pomodoro
      if (e.key === 'p' || e.key === 'P') {
        navigate('/pomodoro');
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [navigate]);

  return null;
}
