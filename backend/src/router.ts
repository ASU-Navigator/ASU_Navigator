import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./trpc.ts";
import { prisma } from "./prismaClient.ts";
import { parseIcsContent, filterEventsForDate } from "./utils/parseIcs.ts";

const scheduleRouter = router({
  upload: protectedProcedure
    .input(z.object({ icsContent: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const events = parseIcsContent(input.icsContent);
      await prisma.schedule.upsert({
        where: { userId },
        update: { rawIcs: input.icsContent },
        create: { userId, rawIcs: input.icsContent },
      });
      return { success: true, totalEvents: events.length };
    }),

  get: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const schedule = await prisma.schedule.findUnique({ where: { userId } });
      if (!schedule) return { hasSchedule: false, events: [] };
      const targetDate = input.date ? new Date(input.date) : new Date();
      const allEvents = parseIcsContent(schedule.rawIcs);
      const dayEvents = filterEventsForDate(allEvents, targetDate);
      return { hasSchedule: true, events: dayEvents };
    }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    await prisma.schedule.deleteMany({ where: { userId } });
    return { success: true };
  }),
});

export const appRouter = router({
  hello: publicProcedure
    .input(z.string().nullish())
    .query(({ input }) => `Hello ${input ?? "world"}!`),

  getSession: publicProcedure.query(({ ctx }) => ctx.session),

  me: protectedProcedure.query(({ ctx }) => ctx.session.user),

  schedule: scheduleRouter,
});

export type AppRouter = typeof appRouter;
