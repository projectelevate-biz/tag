# Analytics Reference (PostHog)

## Provider Component
`src/components/providers/posthog-provider.tsx`

```tsx
'use client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users
    capture_pageview: false // Disable automatic pageview capture if using Next.js router events manually
  });
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

## Page View Tracking (Next.js App Router)
Create a component to listen for path changes.

`src/components/providers/posthog-page-view.tsx`

```tsx
'use client';
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export default function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        '$current_url': url,
      });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
```

## Common Events

| Event Name | Properties | Description |
| :--- | :--- | :--- |
| `user_signed_up` | `method` (email/google) | User creates an account |
| `organization_created` | `org_name` | User creates a new tenant |
| `subscription_started` | `plan_id`, `amount` | User upgrades plan |
| `feature_used` | `feature_name` | Generic feature usage |
