import { router } from '../trpc';
import { authRouter } from './auth';
import { formRouter } from './form';
import { submissionRouter } from './submission';

export const appRouter = router({
  auth: authRouter,
  form: formRouter,
  submission: submissionRouter
});

export type AppRouter = typeof appRouter;
