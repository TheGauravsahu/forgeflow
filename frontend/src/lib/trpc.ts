import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../backend/dist/app-router-type";

export const trpc = createTRPCReact<AppRouter>();
