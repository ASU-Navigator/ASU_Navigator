// backend/src/app.ts
import cors from "cors";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";

// backend/src/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// backend/src/prismaClient.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient();

// backend/src/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:5173"]
});

// backend/src/router.ts
import { z } from "zod";

// backend/src/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { session: ctx.session }
  });
});

// backend/src/utils/parseIcs.ts
import ICAL from "ical.js";
function parseIcsContent(rawIcs) {
  const jcal = ICAL.parse(rawIcs);
  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents("vevent");
  const events = [];
  const endOfYear = new Date((/* @__PURE__ */ new Date()).getFullYear(), 11, 31);
  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    if (event.isRecurring()) {
      const iter = event.iterator();
      let next = iter.next();
      while (next) {
        const startDate = next.toJSDate();
        if (startDate > endOfYear) break;
        const durationMs = event.duration.toSeconds() * 1e3;
        const endDate = new Date(startDate.getTime() + durationMs);
        events.push({
          uid: `${event.uid}-${startDate.toISOString()}`,
          summary: event.summary ?? "Unknown Class",
          location: event.location ?? "",
          start: startDate,
          end: endDate,
          isRecurring: true
        });
        next = iter.next();
      }
    } else {
      events.push({
        uid: event.uid,
        summary: event.summary ?? "Unknown Class",
        location: event.location ?? "",
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        isRecurring: false
      });
    }
  }
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}
function filterEventsForDate(events, date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return events.filter((e) => {
    const s = e.start;
    return s.getFullYear() === y && s.getMonth() === m && s.getDate() === d;
  });
}

// backend/src/router.ts
var scheduleRouter = router({
  upload: protectedProcedure.input(z.object({
    icsContent: z.string().min(1),
    label: z.string().min(1).max(60).default("My Schedule")
  })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const events = parseIcsContent(input.icsContent);
    const schedule = await prisma.schedule.create({
      data: { userId, rawIcs: input.icsContent, label: input.label }
    });
    return { success: true, totalEvents: events.length, scheduleId: schedule.id };
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return prisma.schedule.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, label: true, createdAt: true }
    });
  }),
  get: protectedProcedure.input(z.object({ scheduleId: z.string(), date: z.string().optional() })).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const schedule = await prisma.schedule.findFirst({
      where: { id: input.scheduleId, userId }
    });
    if (!schedule) return { hasSchedule: false, events: [] };
    const targetDate = input.date ? new Date(input.date) : /* @__PURE__ */ new Date();
    const allEvents = parseIcsContent(schedule.rawIcs);
    const dayEvents = filterEventsForDate(allEvents, targetDate);
    return { hasSchedule: true, events: dayEvents };
  }),
  delete: protectedProcedure.input(z.object({ scheduleId: z.string() })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    await prisma.schedule.deleteMany({ where: { id: input.scheduleId, userId } });
    return { success: true };
  }),
  route: protectedProcedure.input(z.object({
    originLat: z.number(),
    originLng: z.number(),
    destLat: z.number(),
    destLng: z.number()
  })).query(async ({ input }) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY not configured");
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${input.originLat},${input.originLng}&destination=${input.destLat},${input.destLng}&mode=walking&key=${apiKey}`
    );
    const data = await res.json();
    if (data.status !== "OK") {
      return { ok: false, error: data.error_message || data.status };
    }
    const route = data.routes?.[0];
    const leg = route?.legs?.[0];
    if (!leg?.duration?.value || !route?.overview_polyline?.points) {
      return { ok: false, error: "Invalid route data" };
    }
    return {
      ok: true,
      durationSeconds: leg.duration.value,
      encodedPolyline: route.overview_polyline.points
    };
  })
});
var appRouter = router({
  hello: publicProcedure.input(z.string().nullish()).query(({ input }) => `Hello ${input ?? "world"}!`),
  getSession: publicProcedure.query(({ ctx }) => ctx.session),
  me: protectedProcedure.query(({ ctx }) => ctx.session.user),
  schedule: scheduleRouter
});

// backend/src/app.ts
var app = express();
app.use(
  cors({
    origin: process.env.BETTER_AUTH_URL ?? "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));
app.post("/api/auth/sign-up/email", (req, res) => {
  const email = req.body?.email?.toLowerCase() ?? "";
  if (!email.endsWith("@asu.edu")) {
    res.status(400).json({ message: "You must use a valid ASU email address (@asu.edu)" });
    return;
  }
  toNodeHandler(auth)(req, res);
});
app.use("/api/auth", (req, res) => {
  toNodeHandler(auth)(req, res);
});
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: async ({ req }) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        return { session };
      } catch {
        return { session: null };
      }
    }
  })
);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: String(err) });
});
var app_default = app;

// api/_build.ts
var build_default = app_default;
export {
  build_default as default
};
