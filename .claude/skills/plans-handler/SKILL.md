---
name: plans-handler
description: Manage subscription plans, pricing, and quotas. Use when adding plan features, updating limits, or building pricing pages.
tools: Read, Write, Edit
model: inherit
---

# Plans Handler

## Instructions

### 1. Adding a New Limit (Quota)
1.  **DB Schema**: Add field to `quotaSchema` in `src/db/schema/plans.ts`.
2.  **Validation**: Add field to `planFormSchema` in `src/lib/validations/plan.schema.ts`.
3.  **UI**: Add input to `src/components/forms/plan-form.tsx`.
4.  **Data**: Ask user to update the plan via `/super-admin/plans` dashboard.

### 2. Creating a Pricing Table
1.  Fetch plans via API.
2.  Use `getSubscribeUrl` for buttons.
3.  Display features from `plan.quotas`.

### 3. Accessing Organization Plan
- **Client**: Use `useOrganization()` hook.
  ```typescript
  const { organization } = useOrganization();
  const plan = organization?.plan;
  ```
- **Server**: Use `withOrganizationAuthRequired` wrapper.
  ```typescript
  const { organization } = session;
  const plan = organization.plan;
  ```

## Reference
For schema details and best practices, see [reference.md](reference.md).
