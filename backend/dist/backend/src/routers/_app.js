"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const trpc_1 = require("../trpc");
const auth_1 = require("./auth");
const form_1 = require("./form");
const submission_1 = require("./submission");
exports.appRouter = (0, trpc_1.router)({
    auth: auth_1.authRouter,
    form: form_1.formRouter,
    submission: submission_1.submissionRouter
});
