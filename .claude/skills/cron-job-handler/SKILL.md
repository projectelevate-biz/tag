---
name: cron-job-handler
description: Create and manage recurring scheduled tasks (cron jobs) using Inngest.
tools: Read, Write, Edit
model: inherit
deps: ["inngest-handler"]
---

# Cron Job Handler Skill

This skill specializes in creating scheduled background tasks using Inngest's Cron functionality.

## When to Use
- **Cleanup**: Delete old data, expired invites, or temp files.
- **Notifications**: Send weekly digests or reminders.
- **Billing**: Reset monthly credit limits or usage quotas.
- **Sync**: Periodic data synchronization with external tools.

## Implementation

### 1. Define the Function
Create a new file in `src/lib/inngest/functions/cron/` (e.g., `cleanup-invites.ts`).

```typescript
import { inngest } from "@/lib/inngest/client";
import { db } from "@/db";
// ... imports

export const cleanupInvites = inngest.createFunction(
  { id: "cleanup-expired-invites" }, // Unique ID
  { cron: "0 0 * * *" }, // Run every day at midnight
  async ({ step }) => {
    const result = await step.run("delete-invites", async () => {
       // ... DB logic to delete expired items
       return { deleted: 5 };
    });
    
    return { success: true, ...result };
  }
);
```

### 2. Register the Function
**MANDATORY**: Add the function to the `functions` array in `src/lib/inngest/functions/index.ts`.

### 3. Testing
-   **Dev Server**: The Inngest Dev Server (`npx inngest-cli dev`) allows you to manually trigger "Cron" events via the "Test" button.
-   **Production**: Inngest Cloud handles the scheduling automatically once deployed.

## Best Practices

1.  **Idempotency**: Ensure your cron job can run multiple times without side effects (e.g., don't double-charge).
2.  **Batching**: If processing many records, use pagination or cursor-based iteration to avoid timeouts.
3.  **Timezones**: Cron schedules are typically UTC. Keep this in mind for "midnight" tasks.
4.  **Monitoring**: Return meaningful data (e.g., `{ processed: 100 }`) so you can see it in the Inngest dashboard logs.
