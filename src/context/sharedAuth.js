import { AuthContext, useAuth } from '../constants/authConstants';

// This small module re-exports non-component values used across the app.
// Keeping these exports out of component files avoids react-refresh warnings.
export { AuthContext, useAuth };
