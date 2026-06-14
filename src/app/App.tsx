import { RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { InstallPrompt } from './components/InstallPrompt';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster />
      <InstallPrompt />
    </AppProvider>
  );
}
