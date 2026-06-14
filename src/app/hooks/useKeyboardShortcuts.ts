import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // N - New Task
      if (e.key === 'n' || e.key === 'N') {
        navigate('/tasks');
      }

      // P - Pomodoro
      if (e.key === 'p' || e.key === 'P') {
        navigate('/pomodoro');
      }

      // Space - handled in Pomodoro component for play/pause
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
};
