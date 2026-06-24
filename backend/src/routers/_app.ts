import { router } from '../trpc';
import { authRouter } from './auth';
import { formRouter } from './form';
import { submissionRouter } from './submission';
import { aiRouter } from './ai';

export const appRouter = router({
  auth: authRouter,
  form: formRouter,
  submission: submissionRouter,
  ai: aiRouter
});

export type AppRouter = typeof appRouter;
