import { Inngest } from "inngest";
import { EventSchemas } from "inngest";
import { InngestEvents } from "./functions";
import { appConfig } from "../config";
import { sentryMiddleware } from "@inngest/middleware-sentry";

const schemas = new EventSchemas().fromRecord<InngestEvents>();

export const inngest = new Inngest({
  id: appConfig.projectSlug,
  schemas,
  middleware: process.env.NEXT_PUBLIC_SENTRY_DSN
    ? [sentryMiddleware()]
    : undefined,
});
