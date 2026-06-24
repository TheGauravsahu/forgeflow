import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { verifyToken, UserSessionPayload } from './auth';

export interface Context {
  user: UserSessionPayload | null;
  ip: string;
}

export async function createContext({ req }: CreateExpressContextOptions): Promise<Context> {
  const ip =
    (req.headers['x-forwarded-for'] as string) ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    return { user, ip };
  }
  return { user: null, ip };
}
export type ContextType = Context;
