import type { z } from "zod";
import type { ConfigSchema } from "../validators";

export type IConfig = z.infer<typeof ConfigSchema>;
