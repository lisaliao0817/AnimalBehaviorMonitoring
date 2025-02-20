'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';

// Define types for our user data
type UserData = {
  userId: Id<"staff">;
  organizationId: Id<"organizations">;
  role: "admin" | "user";
  token: string;
};

// Define the shape of our auth state
type AuthState = {
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
  isLoading: boolean;
};

// Create the context
const AuthContext = createContext<AuthState | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component that wraps your app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const logout = useMutation(api.auth.logout);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  // Validate session on mount and when token changes
  const sessionData = useQuery(
    api.auth.validateSession, 
    user?.token ? { token: user.token } : "skip"
  );

  // Check session validity
  useEffect(() => {
    if (!isLoading && user && sessionData === null) {
      // Session is invalid, log out
      handleLogout();
    }
  }, [sessionData, user, isLoading]);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Route based on role
    if (userData.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    if (user?.token) {
      try {
        await logout({ token: user.token });
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  const value = {
    user,
    login: handleLogin,
    logout: handleLogout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 