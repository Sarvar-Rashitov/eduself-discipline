import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Pomodoro } from './pages/Pomodoro';
import { Calendar } from './pages/Calendar';
import { Reminders } from './pages/reminders';
import { Boards } from './pages/boards';
import { BoardDetail } from './pages/BoardDetail';
import { Notes } from './pages/Notes';
import { Habits } from './pages/Habits';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: '/tasks',
    element: <Layout><Tasks /></Layout>,
  },
  {
    path: '/pomodoro',
    element: <Layout><Pomodoro /></Layout>,
  },
  {
    path: '/calendar',
    element: <Layout><Calendar /></Layout>,
  },
  {
    path: '/reminders',
    element: <Layout><Reminders /></Layout>,
  },
  {
    path: '/boards',
    element: <Layout><Boards /></Layout>,
  },
  {
    path: '/boards/:id',
    element: <Layout><BoardDetail /></Layout>,
  },
  {
    path: '/notes',
    element: <Layout><Notes /></Layout>,
  },
  {
    path: '/habits',
    element: <Layout><Habits /></Layout>,
  },
  {
    path: '/settings',
    element: <Layout><Settings /></Layout>,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
]);