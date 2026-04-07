import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch the public.users profile row and merge it onto the auth user object.
  // This gives every downstream consumer access to full_name, role, status, etc.
  const fetchUserProfile = async (email) => {
    if (!email) return {};
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, role, status')
        .eq('email', email)
        .single();
      if (error) return {};
      return data || {};
    } catch {
      return {};
    }
  };

  const setAuthState = async (authUser) => {
    if (authUser) {
      const profile = await fetchUserProfile(authUser.email);
      // Merge DB profile fields onto the auth user so pages can read
      // user.full_name, user.role, user.status without extra queries.
      const mergedUser = { ...authUser, ...profile };
      setUser(mergedUser);
      setIsAuthenticated(true);
      setIsAdmin(profile.role === 'admin');
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (mounted) await setAuthState(currentUser);
      } catch (error) {
        if (mounted) setAuthError(error.message);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    };

    init();

    const { data: { subscription } } = authAPI.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoadingAuth(false);
      } else {
        await setAuthState(session.user);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const { error } = await authAPI.logout();
      if (error) throw new Error(error);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAuthError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError(error.message);
    }
  };

  const login = async (email, password) => {
    try {
      setAuthError(null);
      const { user: newUser, error } = await authAPI.login(email, password);
      if (error) {
        setAuthError(error);
        return { success: false, error };
      }
      await setAuthState(newUser);
      return { success: true };
    } catch (error) {
      const message = error.message || 'Login failed';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const register = async (email, password, metadata = {}) => {
    try {
      setAuthError(null);
      const { user: newUser, error } = await authAPI.register(email, password, metadata);
      if (error) {
        setAuthError(error);
        return { success: false, error };
      }
      await setAuthState(newUser);
      return { success: true };
    } catch (error) {
      const message = error.message || 'Registration failed';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await authAPI.getCurrentUser();
      await setAuthState(currentUser);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // refreshProfile: call this after the user updates their own profile row
  // so the in-memory user object stays in sync without a full re-auth.
  const refreshProfile = async () => {
    if (!user?.email) return;
    const profile = await fetchUserProfile(user.email);
    setUser(prev => prev ? { ...prev, ...profile } : prev);
    setIsAdmin(profile.role === 'admin');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      isAdmin,
      logout,
      login,
      register,
      checkUserAuth,
      refreshProfile,
      isLoadingPublicSettings: isLoadingAuth,
      navigateToLogin: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
