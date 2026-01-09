"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signin: (emailOrUsername: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  signout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token from localStorage on mount
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (emailOrUsername: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to sign in");
    }

    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("auth_token", data.token);
  };

  const signup = async (email: string, username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to sign up");
    }

    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("auth_token", data.token);
  };

  const signout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signin, signup, signout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
