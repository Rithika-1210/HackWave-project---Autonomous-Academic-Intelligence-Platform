import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => Promise<User>;
}

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  admin: { email: 'admin@aaip.edu', pass: 'Admin@2026!' },
  hod: { email: 'hod.cse@aaip.edu', pass: 'Hod@2026!' },
  faculty: { email: 'dr.elena@aaip.edu', pass: 'Faculty@2026!' },
  student: { email: 'aarav.sharma@aaip.edu', pass: 'Student@2026!' },
  exam_cell: { email: 'examcell@aaip.edu', pass: 'ExamCell@2026!' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aaip_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('aaip_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('aaip_token');
      if (storedToken) {
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
          localStorage.setItem('aaip_user', JSON.stringify(currentUser));
        } catch (err) {
          localStorage.removeItem('aaip_token');
          localStorage.removeItem('aaip_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const data = await authApi.login(email, pass);
    localStorage.setItem('aaip_token', data.access_token);
    localStorage.setItem('aaip_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('aaip_token');
    localStorage.removeItem('aaip_user');
    setUser(null);
    setToken(null);
  };

  const quickSwitchRole = async (role: UserRole): Promise<User> => {
    const creds = DEMO_CREDENTIALS[role];
    return await login(creds.email, creds.pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
        quickSwitchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
