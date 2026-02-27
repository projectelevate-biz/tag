# Cron Job Reference

## Cron Syntax Cheatsheet

| Expression | Description |
| :--- | :--- |
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour (at minute 0) |
| `0 0 * * *` | Every day (at midnight UTC) |
| `0 9 * * 1` | Every Monday at 9am UTC |
| `0 0 1 * *` | First day of every month |

## Example: Monthly Credit Reset

`src/lib/inngest/functions/cron/reset-credits.ts`

```typescript
import { inngest } from "@/lib/inngest/client";
import { db } from "@/db";
import { organizations } from "@/db/schema/organization";
import { eq } from "drizzle-orm";

export const resetMonthlyCredits = inngest.createFunction(
  { id: "reset-monthly-credits" },
  { cron: "0 0 1 * *" }, // 1st of every month
  async ({ step }) => {
    
    // 1. Fetch all organizations (Batching recommended for large scale)
    const orgs = await step.run("fetch-orgs", async () => {
       return await db.select({ id: organizations.id, planId: organizations.planId }).from(organizations);
    });

    // 2. Process each (or dispatch child events for parallelism)
    let resetCount = 0;
    
    for (const org of orgs) {
        if (!org.planId) continue;

        await step.run(`reset-${org.id}`, async () => {
            // Logic to look up plan limits and reset organization.credits
            // ...
        });
        resetCount++;
    }

    return { message: `Reset credits for ${resetCount} organizations` };
  }
);
```

## Multi-Tenancy Note
Cron jobs are global (system-level). They run once for the entire application.
If you need to perform actions *per tenant*, you must iterate through tenants inside the cron job logic (as shown above) or dispatch a separate event for each tenant if independent processing is required.
