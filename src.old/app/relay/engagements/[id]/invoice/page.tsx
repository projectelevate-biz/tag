"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getEngagementById, createInvoiceAndCheckoutInfo } from "@/lib/relay/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Loader2,
  Info,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CreateInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const engagementId = params.id as string;

  const [engagement, setEngagement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Check for success/canceled from Stripe redirect
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success === "true") {
      toast.success("Payment completed successfully!");
      router.push(`/relay/engagements/${engagementId}`);
    } else if (canceled === "true") {
      toast.info("Payment was canceled");
    }
  }, [success, canceled, engagementId, router]);

  useEffect(() => {
    async function loadEngagement() {
      try {
        const data = await getEngagementById(engagementId);
        if (!data) {
          toast.error("Engagement not found");
          router.push("/relay/engagements");
          return;
        }
        setEngagement(data);

        // Pre-fill amount from budget if available
        if (data.budget) {
          setAmount((data.budget / 100).toString());
        }

        // Pre-fill description with deliverables
        if (data.deliverables && data.deliverables.length > 0) {
          setDescription(`Deliverables:\n${data.deliverables.map((d: string) => `• ${d}`).join("\n")}`);
        }
      } catch (error) {
        console.error("Failed to load engagement:", error);
        toast.error("Failed to load engagement");
      } finally {
        setIsLoading(false);
      }
    }
    loadEngagement();
  }, [engagementId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (amountCents <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createInvoiceAndCheckoutInfo(engagementId, amountCents);

      if (result.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!engagement) {
    return null;
  }

  const amountCents = Math.round((parseFloat(amount) || 0) * 100);
  const commission = Math.floor(amountCents * 0.15);
  const consultantPayout = amountCents - commission;
  const hasStripeAccount = engagement.consultantStripeAccountId;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Engagement
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Invoice</h1>
        <p className="text-slate-500 mt-1">
          Create an invoice for "{engagement.title}"
        </p>
      </div>

      {/* Engagement Summary */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-900">
                {engagement.title}
              </h3>
              <p className="text-sm text-indigo-700 mt-1">
                Consultant: {engagement.consultantHeadline}
              </p>
              {engagement.budget && (
                <p className="text-sm text-indigo-700">
                  Budget: ${(engagement.budget / 100).toFixed(0)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>
            Enter the payment amount and description for this invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this invoice is for..."
                className="min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Fee Breakdown */}
            {amountCents > 0 && (
              <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                <h3 className="font-medium text-sm">Fee Breakdown</h3>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">${(amountCents / 100).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (15%)</span>
                  <span className="font-medium text-red-600">
                    -${(commission / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-medium pt-2 border-t">
                  <span>Consultant Payout</span>
                  <span className="text-green-600">
                    ${(consultantPayout / 100).toFixed(2)}
                  </span>
                </div>

                {!hasStripeAccount && (
                  <div className="flex items-start gap-2 pt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Consultant hasn't set up their payout account yet. Funds
                      will be held until they complete onboarding.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border-blue-200 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Payment Process</p>
                <ul className="space-y-1 text-xs">
                  <li>• You'll be redirected to Stripe to complete payment</li>
                  <li>• 15% platform fee supports the marketplace</li>
                  <li>• 85% goes directly to the consultant</li>
                  <li>• Both parties will receive email confirmation</li>
                </ul>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !amount || !description}
                className="bg-indigo-600 hover:bg-indigo-700 flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Create Invoice & Pay ${(parseFloat(amount || "0").toFixed(2))}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
