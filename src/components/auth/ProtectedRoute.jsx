import { Navigate, useLocation } from 'react-router-dom';
import ContextConsumer from '../common/ContextConsumer';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  return (
    <ContextConsumer>
      {({ auth }) => {
        const { user, loading } = auth;

        if (loading) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            </div>
          );
        }

        if (!user) {
          // Redirect to login with the attempted location
          return <Navigate to="/login" state={{ from: location }} replace />;
        }

        return children;
      }}
    </ContextConsumer>
  );
};

export default ProtectedRoute;
