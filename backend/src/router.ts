import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./trpc.ts";

export const appRouter = router({
  hello: publicProcedure
    .input(z.string().nullish())
    .query(({ input }) => `Hello ${input ?? "world"}!`),

  getSession: publicProcedure.query(({ ctx }) => ctx.session),

  me: protectedProcedure.query(({ ctx }) => ctx.session.user),
});

export type AppRouter = typeof appRouter;
