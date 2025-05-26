
import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppProvider } from '@/context/AppContextProvider';
import { AuthProvider } from '@/hooks/useAuth';
import AppRouter from '@/components/AppRouter';
import './App.css';

function App() {
  console.log("App: Rendering App component");
  
  // Check if running on mobile device for styling purposes
  useEffect(() => {
    console.log("App: Running main useEffect");
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      console.log("App: Running on mobile device");
      document.body.classList.add('mobile-device');
    } else {
      console.log("App: Running on desktop device");
    }
  }, []);

  console.log("App: Rendering application");

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <AuthProvider>
        <AppProvider>
          <Router>
            <SidebarProvider defaultOpen>
              <div className="flex min-h-screen w-full">
                <AppRouter />
              </div>
              <Toaster />
            </SidebarProvider>
          </Router>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
