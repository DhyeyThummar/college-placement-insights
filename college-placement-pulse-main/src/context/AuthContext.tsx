import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api';

interface AuthContextType {
  token: string | null;
  userRole: 'admin' | null;
  profile: any;
  signUpAdmin: (name: string, email: string, password: string, collegeName: string, specialKey: string) => Promise<{ error?: any }>;
  signInAdmin: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [userRole, setUserRole] = useState<'admin' | null>((localStorage.getItem('auth_role') as any) || null);
  const [profile, setProfile] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('auth_profile') || 'null'); } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const persist = (jwt: string, role: 'admin', profileObj: any) => {
    setToken(jwt); setUserRole(role); setProfile(profileObj);
    localStorage.setItem('auth_token', jwt);
    localStorage.setItem('auth_role', role);
    localStorage.setItem('auth_profile', JSON.stringify(profileObj));
  };


  const signUpAdmin = async (name: string, email: string, password: string, collegeName: string, specialKey: string) => {
    try {
      const res = await authApi.adminSignup(name, email, password, collegeName, specialKey);
      persist(res.token, 'admin', res.admin);
      return {};
    } catch (error: any) { return { error }; }
  };

  const signInAdmin = async (email: string, password: string) => {
    try {
      const res = await authApi.adminLogin(email, password);
      persist(res.token, 'admin', res.admin);
      return {};
    } catch (error: any) { return { error }; }
  };

  const signOut = async () => {
    setToken(null); setUserRole(null); setProfile(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_profile');
  };

  const value = {
    token,
    userRole,
    profile,
    signUpAdmin,
    signInAdmin,
    signOut,
    isAuthenticated: !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};