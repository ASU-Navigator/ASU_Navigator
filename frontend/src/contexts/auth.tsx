import { createContext, useContext } from "react";
import { signIn, signOut, signUp, useSession } from "../utils/auth/client";

type AuthContextType = {
  signIn: typeof signIn;
  signOut: typeof signOut;
  signUp: typeof signUp;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { useSession };
