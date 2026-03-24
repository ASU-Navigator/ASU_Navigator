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

  route: protectedProcedure
    .input(
      z.object({
        originLat: z.number(),
        originLng: z.number(),
        destLat: z.number(),
        destLng: z.number(),
      }),
    )
    .query(async ({ input }) => {
      console.log('Route query called with:', input);
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY not configured");

      const origin = `${input.originLat},${input.originLng}`;
      const destination = `${input.destLat},${input.destLng}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${apiKey}`;
      console.log('Fetching URL:', url.replace(apiKey, 'API_KEY'));

      const res = await fetch(url);
      const data = await res.json();
      console.log('Directions API response status:', data.status);
      console.log('Directions API response:', data);

      if (data.status !== "OK") {
        return { ok: false as const, error: data.error_message || data.status };
      }

      const route = data.routes?.[0];
      if (!route) {
        return { ok: false as const, error: "No route returned" };
      }

      const leg = route.legs?.[0];
      if (!leg?.duration?.value || !route.overview_polyline?.points) {
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
