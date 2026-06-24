"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
const auth_1 = require("./auth");
async function createContext({ req, res }) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const user = (0, auth_1.verifyToken)(token);
        return { user };
    }
    return { user: null };
}
