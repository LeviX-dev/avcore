import { Navigate } from 'react-router-dom';
import { usePermissions } from '../context/PermissionContext';

const ProtectedRoute = ({ menuKey, children }: any) => {
  const { permissions, loading } = usePermissions();

  if (loading) return <div>Loading...</div>;

  // ✅ Allow access if menuKey is not defined (public routes)
  if (!menuKey) {
    return children;
  }

  // ✅ Only check leaf permissions
  if (!permissions.includes(menuKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;