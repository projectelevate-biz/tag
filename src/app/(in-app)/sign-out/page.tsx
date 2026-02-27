"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FaSpinner } from "react-icons/fa";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    async function signOut() {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    }
    signOut();
  }, [router]);

  return (
    <div className="h-full flex flex-col items-center justify-center py-10 space-y-4">
      <FaSpinner className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Signing you out...</p>
    </div>
  );
}
