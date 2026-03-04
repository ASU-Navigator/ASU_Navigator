import { createAuthClient } from "better-auth/react";

// No baseURL — uses window.location.origin so requests route through the Vite proxy (/api → :3000).
// This ensures cookies are scoped to :5173 and are included in all subsequent tRPC calls.
export const authClient = createAuthClient();

export const { signIn, signOut, signUp, useSession } = authClient;
