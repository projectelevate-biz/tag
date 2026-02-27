"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getConsultantProfile } from "@/lib/rebound/actions";
import {
  createStripeConnectAccount,
  getStripeConnectStatus,
  createLoginLink,
} from "@/lib/stripe-connect/onboarding";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Shield,
  DollarSign,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StripeOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refresh = searchParams.get("refresh");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [refresh]);

  async function loadData() {
    try {
      const profileData = await getConsultantProfile();
      setProfile(profileData);

      if (profileData && profileData.stripeAccountId) {
        const statusData = await getStripeConnectStatus(profileData.id);
        setStatus(statusData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load account information");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStartOnboarding() {
    if (!profile) {
      toast.error("Please create a consultant profile first");
      router.push("/rebound/profile");
      return;
    }

    setIsCreatingAccount(true);
    try {
      const result = await createStripeConnectAccount(profile.id);

      // Redirect to Stripe onboarding
      window.location.href = result.url;
    } catch (error) {
      console.error("Failed to create Stripe Connect account:", error);
      toast.error("Failed to start onboarding process");
    } finally {
      setIsCreatingAccount(false);
    }
  }

  async function handleResumeOnboarding() {
    if (!profile?.onboardingLinkUrl) {
      await handleStartOnboarding();
      return;
    }

    // Redirect to the existing onboarding link
    window.location.href = profile.onboardingLinkUrl;
  }

  async function handleManageAccount() {
    if (!profile) return;

    try {
      const result = await createLoginLink(profile.id);
      window.location.href = result.url;
    } catch (error) {
      console.error("Failed to create login link:", error);
      toast.error("Failed to open Stripe Express account");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Profile Required</AlertTitle>
        <AlertDescription>
          Please create your consultant profile before setting up payments.
          <Button
            variant="outline"
            className="ml-4"
            onClick={() => router.push("/rebound/profile")}
          >
            Create Profile
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Get onboarding progress
  const getProgress = () => {
    if (!status?.hasAccount) return 0;
    if (!status.onboardingComplete) return 33;
    if (!status.payoutsEnabled) return 66;
    return 100;
  };

  const progress = getProgress();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payment Setup</h1>
        <p className="text-slate-500 mt-1">
          Configure your Stripe Connect account to receive payments for your consulting
          work
        </p>
      </div>

      {/* Status Alert */}
      {status?.hasAccount && status.onboardingComplete && status.payoutsEnabled && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Payment Account Setup Complete</AlertTitle>
          <AlertDescription className="text-green-700">
            Your Stripe Connect account is fully configured and ready to receive
            payments. You can manage your account settings anytime.
          </AlertDescription>
        </Alert>
      )}

      {status?.hasAccount && !status.onboardingComplete && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">Complete Your Onboarding</AlertTitle>
          <AlertDescription className="text-yellow-700">
            You&apos;ve started the onboarding process. Please complete it to start
            receiving payments.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Bar */}
      {status?.hasAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-4" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Account Created</span>
              <span>{progress}% Complete</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Steps */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className={status?.hasAccount ? "border-green-200" : ""}>
          <CardHeader>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                status?.hasAccount
                  ? "bg-green-100"
                  : "bg-slate-100"
              }`}
            >
              {status?.hasAccount ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <CreditCard className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              {status?.hasAccount
                ? "Your Stripe Express account has been created"
                : "Create a Stripe Connect Express account"}
            </CardDescription>
          </CardHeader>
          {status?.hasAccount && status.payoutsEnabled && (
            <CardContent>
              <div className="text-sm text-green-600 font-medium">Completed</div>
            </CardContent>
          )}
        </Card>

        <Card
          className={
            status?.hasAccount && status.onboardingComplete
              ? "border-green-200"
              : ""
          }
        >
          <CardHeader>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                status?.onboardingComplete
                  ? "bg-green-100"
                  : "bg-slate-100"
              }`}
            >
              {status?.onboardingComplete ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <Shield className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <CardTitle>Complete Onboarding</CardTitle>
            <CardDescription>
              {status?.onboardingComplete
                ? "All required information has been submitted"
                : "Provide your business details and banking information"}
            </CardDescription>
          </CardHeader>
          {status?.hasAccount && status.payoutsEnabled && (
            <CardContent>
              <div className="text-sm text-green-600 font-medium">Completed</div>
            </CardContent>
          )}
        </Card>

        <Card
          className={
            status?.hasAccount && status.payoutsEnabled
              ? "border-green-200"
              : ""
          }
        >
          <CardHeader>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                status?.payoutsEnabled
                  ? "bg-green-100"
                  : "bg-slate-100"
              }`}
            >
              {status?.payoutsEnabled ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <DollarSign className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <CardTitle>Ready for Payouts</CardTitle>
            <CardDescription>
              {status?.payoutsEnabled
                ? "Your account is ready to receive payments"
                : "Receive payments directly to your bank account"}
            </CardDescription>
          </CardHeader>
          {status?.hasAccount && status.payoutsEnabled && (
            <CardContent>
              <div className="text-sm text-green-600 font-medium">Completed</div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* What to Expect */}
      <Card>
        <CardHeader>
          <CardTitle>How Payments Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Client makes a payment</p>
              <p className="text-muted-foreground">
                When an institution pays for your services through Relay, the payment
                is processed through Stripe.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Platform fee is deducted</p>
              <p className="text-muted-foreground">
                A 15% platform commission is automatically deducted from each payment.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">You receive your earnings</p>
              <p className="text-muted-foreground">
                The remaining amount is automatically transferred to your Stripe
                Connect account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!status?.hasAccount || !status.onboardingComplete ? (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle>Start Receiving Payments</CardTitle>
            <CardDescription>
              Set up your Stripe Connect account to receive payments for your
              consulting work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={
                status?.hasAccount
                  ? handleResumeOnboarding
                  : handleStartOnboarding
              }
              disabled={isCreatingAccount}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isCreatingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : status?.hasAccount ? (
                <>
                  Continue Onboarding
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Start Onboarding
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Manage Your Payment Account</CardTitle>
            <CardDescription>
              Access your Stripe Express dashboard to manage your banking information,
              view payouts, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleManageAccount}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Stripe Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Secure and Compliant</AlertTitle>
        <AlertDescription>
          Stripe Connect is a secure platform that handles all payment processing and
          compliance. Your banking information is stored securely by Stripe and never
          shared with Adaptive Group or client institutions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
