import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./trpc.ts";
import { prisma } from "./prismaClient.ts";
import { parseIcsContent, filterEventsForDate } from "./utils/parseIcs.ts";

const scheduleRouter = router({
  upload: protectedProcedure
    .input(z.object({
      icsContent: z.string().min(1),
      label: z.string().min(1).max(60).default("My Schedule"),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const events = parseIcsContent(input.icsContent);
      const schedule = await prisma.schedule.create({
        data: { userId, rawIcs: input.icsContent, label: input.label },
      });
      return { success: true, totalEvents: events.length, scheduleId: schedule.id };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return prisma.schedule.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, label: true, createdAt: true },
    });
  }),

  get: protectedProcedure
    .input(z.object({ scheduleId: z.string(), date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const schedule = await prisma.schedule.findFirst({
        where: { id: input.scheduleId, userId },
      });
      if (!schedule) return { hasSchedule: false, events: [] };
      const targetDate = input.date ? new Date(input.date) : new Date();
      const allEvents = parseIcsContent(schedule.rawIcs);
      const dayEvents = filterEventsForDate(allEvents, targetDate);
      return { hasSchedule: true, events: dayEvents };
    }),

  delete: protectedProcedure
    .input(z.object({ scheduleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await prisma.schedule.deleteMany({ where: { id: input.scheduleId, userId } });
      return { success: true };
    }),

  route: protectedProcedure
    .input(z.object({
      originLat: z.number(),
      originLng: z.number(),
      destLat: z.number(),
      destLng: z.number(),
    }))
    .query(async ({ input }) => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY not configured");

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${input.originLat},${input.originLng}&destination=${input.destLat},${input.destLng}&mode=walking&key=${apiKey}`
      );
      const data = await res.json();

      if (data.status !== "OK") {
        return { ok: false as const, error: data.error_message || data.status };
      }

      const route = data.routes?.[0];
      const leg = route?.legs?.[0];
      if (!leg?.duration?.value || !route?.overview_polyline?.points) {
        return { ok: false as const, error: "Invalid route data" };
      }

      return {
        ok: true as const,
        durationSeconds: leg.duration.value,
        encodedPolyline: route.overview_polyline.points,
      };
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
