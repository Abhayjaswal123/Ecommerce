import { createContext } from "react";
import type { AuthUser } from "../utils/authStorage";

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
