// localStorage utilities for FlowDesk

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  tags: string[];
  subtasks: { id: string; title: string; completed: boolean }[];
  section: 'today' | 'upcoming' | 'someday';
  createdAt: string;
  linkedPomodoroId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'work' | 'personal' | 'health' | 'learning';
  recurring?: 'daily' | 'weekly';
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  date: string;
  category: 'medication' | 'meeting' | 'exercise' | 'custom';
  enabled: boolean;
  repeat?: 'daily' | 'weekly';
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  emoji: string;
  columns: Column[];
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string;
  assignee: { name: string; color: string };
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  tags: string[];
  comments: number;
  checklist: { id: string; title: string; completed: boolean }[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  completedDates: string[]; // Array of date strings in YYYY-MM-DD format
  createdAt: string;
  streak: number;
}

export interface PomodoroSession {
  id: string;
  type: 'focus' | 'shortBreak' | 'longBreak';
  duration: number; // in seconds
  completedAt: string;
  linkedTaskId?: string;
}

export interface Settings {
  userName: string;
  avatarColor: string;
  pomodoroDurations: {
    focus: number;
    shortBreak: number;
    longBreak: number;
  };
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
}

// Default data
const defaultSettings: Settings = {
  userName: 'Friend',
  avatarColor: '#7C3AED',
  pomodoroDurations: {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  },
  notifications: true,
  theme: 'system',
  accentColor: '#7C3AED',
};

// Storage keys
const KEYS = {
  TASKS: 'flowdesk_tasks',
  EVENTS: 'flowdesk_events',
  REMINDERS: 'flowdesk_reminders',
  BOARDS: 'flowdesk_boards',
  NOTES: 'flowdesk_notes',
  HABITS: 'flowdesk_habits',
  POMODORO_LOG: 'flowdesk_pomodoro_log',
  SETTINGS: 'flowdesk_settings',
};

// Generic storage functions
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  clear: (): void => {
    try {
      Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Specific storage functions
export const tasksStorage = {
  get: (): Task[] => storage.get(KEYS.TASKS, []),
  set: (tasks: Task[]) => storage.set(KEYS.TASKS, tasks),
};

export const eventsStorage = {
  get: (): CalendarEvent[] => storage.get(KEYS.EVENTS, []),
  set: (events: CalendarEvent[]) => storage.set(KEYS.EVENTS, events),
};

export const remindersStorage = {
  get: (): Reminder[] => storage.get(KEYS.REMINDERS, []),
  set: (reminders: Reminder[]) => storage.set(KEYS.REMINDERS, reminders),
};

export const boardsStorage = {
  get: (): Board[] => {
    const boards = storage.get<Board[]>(KEYS.BOARDS, []);
    if (boards.length === 0) {
      // Create default board
      const defaultBoard: Board = {
        id: crypto.randomUUID(),
        name: 'My First Board',
        emoji: '🚀',
        columns: [
          { id: crypto.randomUUID(), title: 'Backlog', cards: [] },
          { id: crypto.randomUUID(), title: 'In Progress', cards: [] },
          { id: crypto.randomUUID(), title: 'Review', cards: [] },
          { id: crypto.randomUUID(), title: 'Done', cards: [] },
        ],
        createdAt: new Date().toISOString(),
      };
      storage.set(KEYS.BOARDS, [defaultBoard]);
      return [defaultBoard];
    }
    return boards;
  },
  set: (boards: Board[]) => storage.set(KEYS.BOARDS, boards),
};

export const notesStorage = {
  get: (): Note[] => storage.get(KEYS.NOTES, []),
  set: (notes: Note[]) => storage.set(KEYS.NOTES, notes),
};

export const habitsStorage = {
  get: (): Habit[] => storage.get(KEYS.HABITS, []),
  set: (habits: Habit[]) => storage.set(KEYS.HABITS, habits),
};

export const pomodoroStorage = {
  get: (): PomodoroSession[] => storage.get(KEYS.POMODORO_LOG, []),
  set: (sessions: PomodoroSession[]) => storage.set(KEYS.POMODORO_LOG, sessions),
};

export const settingsStorage = {
  get: (): Settings => storage.get(KEYS.SETTINGS, defaultSettings),
  set: (settings: Settings) => storage.set(KEYS.SETTINGS, settings),
};

// Export all data as JSON
export const exportAllData = () => {
  const data = {
    tasks: tasksStorage.get(),
    events: eventsStorage.get(),
    reminders: remindersStorage.get(),
    boards: boardsStorage.get(),
    notes: notesStorage.get(),
    habits: habitsStorage.get(),
    pomodoroLog: pomodoroStorage.get(),
    settings: settingsStorage.get(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

// Import data from JSON
export const importData = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.tasks) tasksStorage.set(data.tasks);
    if (data.events) eventsStorage.set(data.events);
    if (data.reminders) remindersStorage.set(data.reminders);
    if (data.boards) boardsStorage.set(data.boards);
    if (data.notes) notesStorage.set(data.notes);
    if (data.habits) habitsStorage.set(data.habits);
    if (data.pomodoroLog) pomodoroStorage.set(data.pomodoroLog);
    if (data.settings) settingsStorage.set(data.settings);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
