import { z } from 'zod';
export declare const ConfigResponseSchema: z.ZodObject<{
    supportedBlockchains: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        currency_id: z.ZodString;
        currency_name: z.ZodString;
        currency_ticker: z.ZodString;
    }, z.core.$strip>>;
    referralUrl: z.ZodString;
    domainUrl: z.ZodString;
    appDependencies: z.ZodArray<z.ZodObject<{
        blockchain: z.ZodString;
        appName: z.ZodString;
        dependencies: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map