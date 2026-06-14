// FlowDesk utility functions

export const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Focus on being productive instead of busy.",
  "You don't have to be great to start, but you have to start to be great.",
  "The way to get started is to quit talking and begin doing.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Discipline is choosing between what you want now and what you want most.",
  "Small daily improvements over time lead to stunning results.",
  "Success is the sum of small efforts repeated day in and day out.",
  "You are what you do, not what you say you'll do.",
];

export const getRandomQuote = (): string => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;

  const sortedDates = [...completedDates].sort().reverse();
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(sortedDates[i]);
    checkDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const calculateDisciplineScore = (data: {
  tasksCompleted: number;
  totalTasks: number;
  pomodoroSessions: number;
  habitsChecked: number;
  totalHabits: number;
}): number => {
  const taskScore = data.totalTasks > 0 ? (data.tasksCompleted / data.totalTasks) * 40 : 0;
  const pomodoroScore = Math.min(data.pomodoroSessions * 5, 30);
  const habitScore = data.totalHabits > 0 ? (data.habitsChecked / data.totalHabits) * 30 : 0;

  return Math.round(taskScore + pomodoroScore + habitScore);
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, body: string): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  }
};

export const playSound = (type: 'complete' | 'timer'): void => {
  // Create a simple beep sound using Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === 'complete') {
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } else if (type === 'timer') {
    oscillator.frequency.value = 600;
    gainNode.gain.value = 0.15;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
