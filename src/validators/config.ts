import { z } from "zod";

export const ConfigSchema = z.object({
  mode: z.enum(["uat", "live"]),
  clientId: z.string().min(5, "Client ID is requred"),
  clientSecret: z.string().min(5, "Client Secret is required"),
  debug: z.boolean().optional().default(false),
});
