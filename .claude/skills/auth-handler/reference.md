# Auth Architecture Reference

## Key Files
- **Config**: `src/auth.ts` (NextAuth v5, Providers, Adapter)
- **Schema**:
  - `src/db/schema/user.ts`
  - `src/db/schema/organization.ts`
  - `src/db/schema/organization-membership.ts`
- **Middleware**: `src/proxy.ts` (Route protection)

## Helpers
- `src/lib/auth/withOrganizationAuthRequired.ts` (Tenant Context)
- `src/lib/auth/withAuthRequired.ts` (User Context)
- `src/lib/auth/withSuperAdminAuthRequired.ts` (Admin Context)
- `src/lib/auth/cronAuthRequired.ts`
- `src/lib/users/useUser.ts` (Frontend User Hook)
- `src/lib/organizations/useOrganization.ts` (Frontend Org Hook)

## Best Practices
1. **Defense in Depth**: Middleware (`proxy.ts`) is the first layer, but route wrappers are mandatory.
2. **Multi-Tenancy**: Always use `withOrganizationAuthRequired` for routes that access organization data.
3. **Database**: Update `src/db/schema/user.ts` for user model changes.
4. **Environment**: Check `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `SUPER_ADMIN_EMAILS`.

## Common Tasks
- **Debugging Login**: Check providers in `auth.ts`.
- **Impersonation**: Supported via custom Credentials provider.
