import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, LoginCredentials, UserRole } from './types.js';
import { ROLE_NAV_PERMISSIONS } from './types.js';
import { authService, DEMO_CREDENTIALS } from './authService.js';
import type { NavItemKey } from '../components/layout/Sidebar.js';

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  canAccess: (tab: NavItemKey) => boolean;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Default to Enforcement Inspector for initial seamless view
          const defaultOfficer = DEMO_CREDENTIALS.ENFORCEMENT_INSPECTOR.user;
          setUser(defaultOfficer);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.login(credentials);
      setUser(authenticatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const canAccess = (tab: NavItemKey): boolean => {
    if (!user) return false;
    const allowedTabs = ROLE_NAV_PERMISSIONS[user.role];
    return allowedTabs ? allowedTabs.includes(tab) : false;
  };

  const switchDemoRole = async (newRole: UserRole): Promise<void> => {
    const demo = DEMO_CREDENTIALS[newRole];
    if (demo) {
      await login({ email: demo.user.email, password: demo.defaultPass });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        canAccess,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
