import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import MediaListPage from './pages/media/MediaListPage';
import MediaDetailPage from './pages/media/MediaDetailPage';
import MediaUploadPage from './pages/media/MediaUploadPage';
import MediaEditPage from './pages/media/MediaEditPage';
import TrashPage from './pages/media/TrashPage';
import UserListPage from './pages/users/UserListPage';
import UserFormPage from './pages/users/UserFormPage';
import ActivityLogPage from './pages/activity/ActivityLogPage';
import ProfilePage from './pages/profile/ProfilePage';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RoleBasedRoute = ({ children, roles }) => {
  const { user, loading, hasRole } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(roles)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="media" element={<MediaListPage />} />
        <Route path="media/upload" element={<MediaUploadPage />} />
        <Route path="media/:id" element={<MediaDetailPage />} />
        <Route path="media/:id/edit" element={<MediaEditPage />} />
        <Route
          path="trash"
          element={
            <RoleBasedRoute roles={['SUPERADMIN']}>
              <TrashPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="users"
          element={
            <RoleBasedRoute roles={['SUPERADMIN']}>
              <UserListPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="users/create"
          element={
            <RoleBasedRoute roles={['SUPERADMIN']}>
              <UserFormPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="users/:id/edit"
          element={
            <RoleBasedRoute roles={['SUPERADMIN']}>
              <UserFormPage />
            </RoleBasedRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}