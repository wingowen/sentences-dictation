import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

// Layout
import { AdminLayout } from '@/components/layout/AdminLayout';

// Pages
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { ArticlesPage } from '@/pages/Articles';
import { ArticleDetailPage } from '@/pages/ArticleDetail';
import { ArticleEditorPage } from '@/pages/ArticleEditor';
import { SentencesPage } from '@/pages/Sentences';
import { TagsPage } from '@/pages/Tags';
import { StatisticsPage } from '@/pages/Statistics';
import { SettingsPage } from '@/pages/Settings';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
}

// Public Route Wrapper (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles"
        element={
          <ProtectedRoute>
            <ArticlesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles/new"
        element={
          <ProtectedRoute>
            <ArticleEditorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles/:id"
        element={
          <ProtectedRoute>
            <ArticleDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles/:id/edit"
        element={
          <ProtectedRoute>
            <ArticleEditorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sentences"
        element={
          <ProtectedRoute>
            <SentencesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tags"
        element={
          <ProtectedRoute>
            <TagsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <StatisticsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
