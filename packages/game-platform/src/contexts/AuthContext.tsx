"use client";

import { createClient } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  uid?: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signin: (emailOrUsername: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null;

function mapUser(raw: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): User {
  const usernameFromMeta = raw.user_metadata?.username;
  const username =
    typeof usernameFromMeta === "string" && usernameFromMeta.trim().length > 0
      ? usernameFromMeta
      : (raw.email ?? "").split("@")[0] || "player";

  return {
    id: raw.id,
    email: raw.email ?? "",
    username,
    isAdmin: false,
    uid: raw.id,
    displayName: username,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const boot = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      if (error || !data.session) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      setUser(mapUser(data.session.user));
      setToken(data.session.access_token);
      setIsLoading(false);
    };

    void boot();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      if (!session) {
        setUser(null);
        setToken(null);
        return;
      }

      setUser(mapUser(session.user));
      setToken(session.access_token);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      signin: async (emailOrUsername: string, password: string) => {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        if (!emailOrUsername.includes("@")) {
          throw new Error("Please use your email address to sign in.");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.session) {
          setUser(mapUser(data.session.user));
          setToken(data.session.access_token);
        }
      },
      signup: async (email: string, username: string, password: string) => {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.session) {
          setUser(mapUser(data.session.user));
          setToken(data.session.access_token);
        }
      },
      signout: async () => {
        if (!supabase) {
          setUser(null);
          setToken(null);
          return;
        }

        await supabase.auth.signOut();
        setUser(null);
        setToken(null);
      },
      refreshUser: async () => {
        if (!supabase) {
          return;
        }

        const {
          data: { user: refreshedUser },
        } = await supabase.auth.getUser();

        if (!refreshedUser) {
          setUser(null);
          setToken(null);
          return;
        }

        setUser(mapUser(refreshedUser));
      },
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context !== undefined) {
    return context;
  }

  return {
    user: null,
    token: null,
    isLoading: false,
    signin: async () => {
      throw new Error("AuthProvider is not mounted.");
    },
    signup: async () => {
      throw new Error("AuthProvider is not mounted.");
    },
    signout: async () => {},
    refreshUser: async () => {},
  };
}
