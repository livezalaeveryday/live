import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { initialCurrentUser } from '../api/mockData';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateCredits: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateCredits: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Auto-check session on launch
    const checkSession = async () => {
      try {
        // By default on first launch, load current user session
        setUser(initialCurrentUser);
        apiClient.setToken('initial_session_token');
      } catch (e) {
        console.error('Session check failed', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // In production React Native, this calls @react-native-google-signin/google-signin
      // Here it connects through the API mobile bridge
      const result = await apiClient.googleMobileLogin('google_id_token_from_device');
      setUser(result.user);
      apiClient.setToken(result.token);
    } catch (e) {
      console.error('Sign in error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    apiClient.setToken(null);
  };

  const updateCredits = (amount: number) => {
    if (user) {
      setUser({ ...user, credits: user.credits + amount });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut, updateCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
