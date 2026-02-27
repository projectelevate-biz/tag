---
name: analytics-handler
description: Manage product analytics, event tracking, and user identification using PostHog.
tools: Read, Write, Edit
model: inherit
---

# Analytics Handler Skill

This skill guides you through setting up and using PostHog for product analytics in a Next.js application.

## 1. Setup (If not installed)

1.  **Install**: `npm install posthog-js`
2.  **Environment**: Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.local`.
3.  **Provider**: Create `src/components/providers/posthog-provider.tsx`.
    -   Initialize PostHog client.
    -   Wrap the application in `layout.tsx`.

## 2. Tracking Events (Client-Side)

Use the `usePostHog` hook to track user interactions.

```tsx
import { usePostHog } from 'posthog-js/react';

export function SignupButton() {
  const posthog = usePostHog();

  const onClick = () => {
    posthog.capture('signup_clicked', { source: 'header' });
  };

  return <button onClick={onClick}>Sign Up</button>;
}
```

## 3. User Identification

**Crucial**: Identify users as soon as they log in to link anonymous events to the actual user.

-   **Where**: In your `AuthProvider` or a dedicated `AnalyticsListener` component inside the main App Layout.
-   **Code**:
    ```tsx
    useEffect(() => {
      if (user) {
        posthog.identify(user.id, {
          email: user.email,
          name: user.name,
          organizationId: organization?.id // Multi-tenancy
        });
      } else {
        posthog.reset(); // Clear on logout
      }
    }, [user]);
    ```

## 4. Server-Side Tracking (Optional)

For critical events (Billing, API usage) that happen on the backend:
1.  Install `posthog-node`.
2.  Initialize a server client.
3.  Call `client.capture({ distinctId: user.id, event: '...' })`.

## 5. Best Practices

-   **Naming**: Use `noun_verb` format (e.g., `project_created`, `credits_purchased`).
-   **Properties**: Always send relevant metadata (e.g., `plan_id`, `amount`).
-   **Privacy**: Do not track sensitive PII (passwords, credit card numbers) in event properties.
