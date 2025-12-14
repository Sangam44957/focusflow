import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { AIPlanner } from './pages/AIPlanner';
import { Analytics } from './pages/Analytics';
import { Calendar } from './pages/Calendar';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><MainLayout><Projects /></MainLayout></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><MainLayout><ProjectDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/ai-planner" element={<ProtectedRoute><MainLayout><AIPlanner /></MainLayout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><MainLayout><Calendar /></MainLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 3000,
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;