import type { BaseURL } from "../types";

export const BaseUrls: BaseURL = {
  uat: String(process.env.UAT_URL),
  live: String(process.env.PROD_URL),
};
