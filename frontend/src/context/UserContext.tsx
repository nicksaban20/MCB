"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface UserContextType {
  user: any;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, initialSession }: { children: ReactNode, initialSession: any }) => {
  const [user, setUser] = useState<any>(initialSession?.user || null);
  const [loading, setLoading] = useState(!initialSession);

  useEffect(() => {
    if (!initialSession) {
      const fetchUser = async () => {
        const response = await supabase.auth.getUser();
        setUser(response.data.user);
        setLoading(false);
      };
      fetchUser();
    }
  }, [initialSession]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
