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
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY not configured");

      const res = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.duration,routes.polyline.encodedPolyline",
          },
          body: JSON.stringify({
            origin: { location: { latLng: { latitude: input.originLat, longitude: input.originLng } } },
            destination: { location: { latLng: { latitude: input.destLat, longitude: input.destLng } } },
            travelMode: "WALK",
          }),
        },
      );

      type RoutesResponse = {
        routes?: { duration?: string; polyline?: { encodedPolyline?: string } }[];
        error?: { message?: string; status?: string };
      };
      const data = await res.json() as RoutesResponse;

      if (data.error) {
        return { ok: false as const, error: data.error.message ?? data.error.status ?? "Routes API error" };
      }

      const route = data.routes?.[0];
      if (!route?.duration || !route.polyline?.encodedPolyline) {
        return { ok: false as const, error: "No route returned" };
      }

      return {
        ok: true as const,
        durationSeconds: parseInt(route.duration, 10),
        encodedPolyline: route.polyline.encodedPolyline,
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
