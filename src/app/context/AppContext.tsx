import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Task,
  CalendarEvent,
  Reminder,
  Board,
  Note,
  Habit,
  PomodoroSession,
  Settings,
  tasksStorage,
  eventsStorage,
  remindersStorage,
  boardsStorage,
  notesStorage,
  habitsStorage,
  pomodoroStorage,
  settingsStorage,
} from '../lib/storage';

interface AppContextType {
  // Data
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  boards: Board[];
  notes: Note[];
  habits: Habit[];
  pomodoroSessions: PomodoroSession[];
  settings: Settings;

  // Setters
  setTasks: (tasks: Task[]) => void;
  setEvents: (events: CalendarEvent[]) => void;
  setReminders: (reminders: Reminder[]) => void;
  setBoards: (boards: Board[]) => void;
  setNotes: (notes: Note[]) => void;
  setHabits: (habits: Habit[]) => void;
  setPomodoroSessions: (sessions: PomodoroSession[]) => void;
  setSettings: (settings: Settings) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // PWA Install
  showInstallPrompt: boolean;
  dismissInstallPrompt: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [events, setEventsState] = useState<CalendarEvent[]>([]);
  const [reminders, setRemindersState] = useState<Reminder[]>([]);
  const [boards, setBoardsState] = useState<Board[]>([]);
  const [notes, setNotesState] = useState<Note[]>([]);
  const [habits, setHabitsState] = useState<Habit[]>([]);
  const [pomodoroSessions, setPomodoroSessionsState] = useState<PomodoroSession[]>([]);
  const [settings, setSettingsState] = useState<Settings>(settingsStorage.get());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    setTasksState(tasksStorage.get());
    setEventsState(eventsStorage.get());
    setRemindersState(remindersStorage.get());
    setBoardsState(boardsStorage.get());
    setNotesState(notesStorage.get());
    setHabitsState(habitsStorage.get());
    setPomodoroSessionsState(pomodoroStorage.get());
    
    const savedSettings = settingsStorage.get();
    setSettingsState(savedSettings);

    // Check if user has dismissed install prompt before
    const installDismissed = localStorage.getItem('flowdesk_install_dismissed');
    if (installDismissed) {
      setShowInstallPrompt(false);
    }
  }, []);

  // Apply theme based on settings
  useEffect(() => {
    const applyTheme = () => {
      if (settings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      } else {
        setTheme(settings.theme);
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTasks = (newTasks: Task[]) => {
    setTasksState(newTasks);
    tasksStorage.set(newTasks);
  };

  const setEvents = (newEvents: CalendarEvent[]) => {
    setEventsState(newEvents);
    eventsStorage.set(newEvents);
  };

  const setReminders = (newReminders: Reminder[]) => {
    setRemindersState(newReminders);
    remindersStorage.set(newReminders);
  };

  const setBoards = (newBoards: Board[]) => {
    setBoardsState(newBoards);
    boardsStorage.set(newBoards);
  };

  const setNotes = (newNotes: Note[]) => {
    setNotesState(newNotes);
    notesStorage.set(newNotes);
  };

  const setHabits = (newHabits: Habit[]) => {
    setHabitsState(newHabits);
    habitsStorage.set(newHabits);
  };

  const setPomodoroSessions = (newSessions: PomodoroSession[]) => {
    setPomodoroSessionsState(newSessions);
    pomodoroStorage.set(newSessions);
  };

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
    settingsStorage.set(newSettings);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setSettings({ ...settings, theme: newTheme });
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('flowdesk_install_dismissed', 'true');
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        events,
        reminders,
        boards,
        notes,
        habits,
        pomodoroSessions,
        settings,
        setTasks,
        setEvents,
        setReminders,
        setBoards,
        setNotes,
        setHabits,
        setPomodoroSessions,
        setSettings,
        theme,
        toggleTheme,
        showInstallPrompt,
        dismissInstallPrompt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
