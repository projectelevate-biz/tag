---
name: auth-handler
description: Manage authentication, authorization, and user sessions. Use when dealing with login, sign-up, API protection, middleware, or user data fetching.
tools: Read, Write, Edit
model: inherit
---

# Auth Handler

## Instructions

### 1. API Route Protection
- **Tenant Routes**: Use `withOrganizationAuthRequired`.
  ```typescript
  export default withOrganizationAuthRequired(async (req, { session }) => {
     const { organization } = session; // Access current organization
  }, 'user'); // Required role
  ```
- **User Routes**: Use `withAuthRequired`.
  ```typescript
  export default withAuthRequired(async (req, { session }) => { ... })
  ```
- **Super Admin Routes**: Use `withSuperAdminAuthRequired`.
- **Cron Jobs**: Use `cronAuthRequired`.
- **Defense in Depth**: Do NOT rely solely on middleware. Always implement individual route protection.

### 2. Frontend Data Access
- **Organization Context**: Use `useOrganization()` hook to get current org, role, and membership.
- **User Context**: Use `useUser()` hook (SWR).
- **Restriction**: NEVER use `useSession` from `next-auth/react` directly if `useUser` or `useOrganization` suffices.

### 3. Server-Side Data Access
- **Check Auth**: Import `auth` from `@/auth`.
- **Get Context**: Use the `session` object provided by the wrappers (`withOrganizationAuthRequired`) which includes fully typed `user` and `organization`.

## Reference
For architecture details, key files, and debugging tips, see [reference.md](reference.md).
