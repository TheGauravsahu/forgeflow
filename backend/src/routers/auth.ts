import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { RegisterInputSchema, LoginInputSchema } from '../types/shared';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { db } from '../db';
import { hashPassword, verifyPassword, generateToken } from '../auth';

export const authRouter = router({
  register: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/register',
        tags: ['auth'],
        summary: 'Register a new user'
      }
    })
    .input(RegisterInputSchema)
    .output(z.object({
      token: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string().nullable()
      })
    }))
    .mutation(async ({ input }) => {
      const existingUser = await db.user.findUnique({
        where: { email: input.email }
      });
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with that email already exists.'
        });
      }

      const passwordHash = hashPassword(input.password);
      const user = await db.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name
        }
      });

      const token = generateToken({ userId: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    }),

  login: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/login',
        tags: ['auth'],
        summary: 'Login user'
      }
    })
    .input(LoginInputSchema)
    .output(z.object({
      token: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string().nullable()
      })
    }))
    .mutation(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { email: input.email }
      });
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.'
        });
      }

      const isValid = verifyPassword(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.'
        });
      }

      const token = generateToken({ userId: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    }),

  me: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/me',
        tags: ['auth'],
        summary: 'Get current user details'
      }
    })
    .input(z.void())
    .output(z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable()
    }))
    .query(async ({ ctx }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.user.userId }
      });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.'
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name
      };
    }),

  update: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6).optional()
    }))
    .output(z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.user.userId }
      });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.'
        });
      }

      const updateData: any = {};
      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.email !== undefined && input.email !== user.email) {
        const emailTaken = await db.user.findUnique({ where: { email: input.email } });
        if (emailTaken) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already in use.'
          });
        }
        updateData.email = input.email;
      }

      if (input.newPassword) {
        if (!input.currentPassword) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Current password is required to set a new password.'
          });
        }
        const isValid = verifyPassword(input.currentPassword, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Incorrect current password.'
          });
        }
        updateData.passwordHash = hashPassword(input.newPassword);
      }

      const updated = await db.user.update({
        where: { id: ctx.user.userId },
        data: updateData
      });

      return {
        id: updated.id,
        email: updated.email,
        name: updated.name
      };
    })
});
