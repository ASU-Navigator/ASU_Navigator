import "dotenv/config";
import cors from "cors";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.ts";
import { appRouter } from "./router.ts";
import type { TRPCContext } from "./trpc.ts";

const app = express();

app.use(
  cors({
    origin: process.env.BETTER_AUTH_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// ASU email guard — must be registered before the generic /api/auth handler.
// Note: do NOT override req.url — better-call reconstructs the full path from
// req.baseUrl + req.url, so overriding with req.originalUrl would double the prefix.
app.post("/api/auth/sign-up/email", (req, res) => {
  const email = (req.body?.email as string | undefined)?.toLowerCase() ?? "";
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
    createContext: async ({ req }): Promise<TRPCContext> => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      return { session };
    },
  }),
);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});