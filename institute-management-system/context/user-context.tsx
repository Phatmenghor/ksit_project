"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getStaffByTokenService } from "@/service/user/user.service";
import { StaffModel } from "@/model/user/staff/staff.respond.model";

interface UserContextType {
  user: StaffModel | undefined;
}

const UserContext = createContext<UserContextType>({ user: undefined });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffModel | undefined>(undefined);

  useEffect(() => {
    getStaffByTokenService()
      .then((response) => setUser(response))
      .catch(() => {});
  }, []);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(UserContext);
}
