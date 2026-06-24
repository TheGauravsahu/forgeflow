"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const shared_1 = require("@forgeflow/shared");
const trpc_1 = require("../trpc");
const db_1 = require("../db");
const auth_1 = require("../auth");
exports.authRouter = (0, trpc_1.router)({
    register: trpc_1.publicProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/auth/register',
            tags: ['auth'],
            summary: 'Register a new user'
        }
    })
        .input(shared_1.RegisterInputSchema)
        .output(zod_1.z.object({
        token: zod_1.z.string(),
        user: zod_1.z.object({
            id: zod_1.z.string(),
            email: zod_1.z.string(),
            name: zod_1.z.string().nullable()
        })
    }))
        .mutation(async ({ input }) => {
        const existingUser = await db_1.db.user.findUnique({
            where: { email: input.email }
        });
        if (existingUser) {
            throw new server_1.TRPCError({
                code: 'CONFLICT',
                message: 'An account with that email already exists.'
            });
        }
        const passwordHash = (0, auth_1.hashPassword)(input.password);
        const user = await db_1.db.user.create({
            data: {
                email: input.email,
                passwordHash,
                name: input.name
            }
        });
        const token = (0, auth_1.generateToken)({ userId: user.id, email: user.email });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        };
    }),
    login: trpc_1.publicProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/auth/login',
            tags: ['auth'],
            summary: 'Login user'
        }
    })
        .input(shared_1.LoginInputSchema)
        .output(zod_1.z.object({
        token: zod_1.z.string(),
        user: zod_1.z.object({
            id: zod_1.z.string(),
            email: zod_1.z.string(),
            name: zod_1.z.string().nullable()
        })
    }))
        .mutation(async ({ input }) => {
        const user = await db_1.db.user.findUnique({
            where: { email: input.email }
        });
        if (!user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Invalid email or password.'
            });
        }
        const isValid = (0, auth_1.verifyPassword)(input.password, user.passwordHash);
        if (!isValid) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Invalid email or password.'
            });
        }
        const token = (0, auth_1.generateToken)({ userId: user.id, email: user.email });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        };
    }),
    me: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/auth/me',
            tags: ['auth'],
            summary: 'Get current user details'
        }
    })
        .input(zod_1.z.void())
        .output(zod_1.z.object({
        id: zod_1.z.string(),
        email: zod_1.z.string(),
        name: zod_1.z.string().nullable()
    }))
        .query(async ({ ctx }) => {
        const user = await db_1.db.user.findUnique({
            where: { id: ctx.user.userId }
        });
        if (!user) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found.'
            });
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name
        };
    })
});
