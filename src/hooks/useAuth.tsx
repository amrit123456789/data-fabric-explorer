import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { UiPath, UiPathError } from '@uipath/uipath-typescript/core';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  sdk: UiPath;
  login: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdk] = useState<UiPath>(() => new UiPath());
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    (async () => {
      setIsLoading(true);
      try {
        if (sdk.isInOAuthCallback()) {
          await sdk.completeOAuth();
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setIsAuthenticated(sdk.isAuthenticated());
      } catch (err) {
        setError(err instanceof UiPathError ? err.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [sdk]);

  const login = async () => {
    setIsLoading(true);
    try { await sdk.initialize(); }
    catch (err) { setError(err instanceof UiPathError ? err.message : 'Login failed'); }
    finally { setIsLoading(false); }
  };

  const logout = () => { sdk.logout(); setIsAuthenticated(false); setError(null); };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, sdk, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};