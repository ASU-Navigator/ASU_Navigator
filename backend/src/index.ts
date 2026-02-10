import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
import { router, publicProcedure } from './trpc.ts';
import { z } from 'zod';

// 1. Define Router
const appRouter = router({
  hello: publicProcedure
    .input(z.string().nullish())
    .query(({ input }) => {
      return `Hello ${input ?? 'world'}!`;
    }),
});

// Export type router type
export type AppRouter = typeof appRouter;

// 2. Express Server
const app = express();
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  }),
);

app.listen(3000, () => {
  console.log('tRPC server running on http://localhost:3000/trpc');
});