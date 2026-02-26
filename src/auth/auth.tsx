import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initDb, getStaffByUsername, Staff } from "../db/db";

type AuthContextType = {
  userToken: string | null;
  currentUser: Staff | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken]     = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        initDb();
        const token    = await AsyncStorage.getItem("userToken");
        const username = await AsyncStorage.getItem("username");
        if (token && username) {
          const staff = getStaffByUsername(username);
          setUserToken(token);
          setCurrentUser(staff);
        }
      } catch (e) {
        console.error("❌ Bootstrap error:", e);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const signIn = async (username: string, password: string): Promise<boolean> => {
    const staff = getStaffByUsername(username.trim().toLowerCase());
    if (staff && staff.password === password) {
      const token = `token-${staff.id}`;
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("username", staff.username);
      setUserToken(token);
      setCurrentUser(staff);
      return true;
    }
    return false;
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("username");
    setUserToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, currentUser, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}