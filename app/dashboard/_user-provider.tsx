"use client";
import { createContext, useContext, useState } from "react";

/*
basic shit for now as this only needs to be used on Sidebar
and probably avatar uploader for yk
*/
type User = {
  username: string;
  config?: {
    avatar_url: string | null;
  } | null;
};

const UserContext = createContext<{
  user: User | null;
  setUser: (user: User) => void;
} | null>(null);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used outside of UserProvider");
  return ctx;
};
