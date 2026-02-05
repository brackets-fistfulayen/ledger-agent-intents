import { z } from "zod";

export const ConfigResponseSchema = z.object({
  supportedBlockchains: z.array(
    z.object({
      id: z.string(),
      currency_id: z.string(),
      currency_name: z.string(),
      currency_ticker: z.string(),
    }),
  ),
  referralUrl: z.string(),
  domainUrl: z.string(),
  appDependencies: z.array(
    z.object({
      blockchain: z.string(),
      appName: z.string(),
      dependencies: z.array(z.string()),
    }),
  ),
});
