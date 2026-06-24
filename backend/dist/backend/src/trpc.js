"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedProcedure = exports.middleware = exports.publicProcedure = exports.router = void 0;
const server_1 = require("@trpc/server");
const t = server_1.initTRPC.meta().context().create();
exports.router = t.router;
exports.publicProcedure = t.procedure;
exports.middleware = t.middleware;
const isAuthed = (0, exports.middleware)(({ next, ctx }) => {
    if (!ctx.user) {
        throw new server_1.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to perform this action.'
        });
    }
    return next({
        ctx: {
            user: ctx.user
        }
    });
});
exports.protectedProcedure = t.procedure.use(isAuthed);
