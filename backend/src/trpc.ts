import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
};

type AuthSession = {
  id: string;
  expiresAt: Date;
  token: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TRPCContext = {
  session: { user: AuthUser; session: AuthSession } | null;
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { session: ctx.session },
  });
});
