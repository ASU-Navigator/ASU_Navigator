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
app.all("/api/auth/*", toNodeHandler(auth));
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