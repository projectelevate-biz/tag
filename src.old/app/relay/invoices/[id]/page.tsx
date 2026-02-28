"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Download,
  DollarSign,
  Calendar,
  Home,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    async function loadInvoice() {
      try {
        const response = await fetch(`/api/relay/invoices/${invoiceId}`);
        if (response.ok) {
          const data = await response.json();
          setInvoice(data.invoice);
          setEngagement(data.engagement);
        } else {
          toast.error("Failed to load invoice");
        }
      } catch (error) {
        console.error("Failed to load invoice:", error);
        toast.error("Failed to load invoice details");
      } finally {
        setIsLoading(false);
      }
    }
    loadInvoice();
  }, [invoiceId]);

  function downloadReceipt() {
    // TODO: Implement PDF receipt generation
    toast.info("Receipt download coming soon");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Invoice not found</h3>
          <Button onClick={() => router.push("/relay/engagements")} variant="outline">
            Back to Engagements
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isSuccess = invoice.status === "PAID" || success === "true";
  const isCanceled = canceled === "true";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Status Banner */}
      <Card
        className={
          isSuccess
            ? "bg-green-50 border-green-200"
            : isCanceled
            ? "bg-yellow-50 border-yellow-200"
            : "bg-blue-50 border-blue-200"
        }
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {isSuccess ? (
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            ) : isCanceled ? (
              <div className="p-3 bg-yellow-100 rounded-full">
                <XCircle className="h-8 w-8 text-yellow-600" />
              </div>
            ) : (
              <div className="p-3 bg-blue-100 rounded-full">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            )}
            <div>
              <h2
                className={`text-xl font-semibold ${
                  isSuccess
                    ? "text-green-900"
                    : isCanceled
                    ? "text-yellow-900"
                    : "text-blue-900"
                }`}
              >
                {isSuccess
                  ? "Payment Successful!"
                  : isCanceled
                  ? "Payment Canceled"
                  : "Payment Pending"}
              </h2>
              <p
                className={`text-sm ${
                  isSuccess
                    ? "text-green-700"
                    : isCanceled
                    ? "text-yellow-700"
                    : "text-blue-700"
                }`}
              >
                {isSuccess
                  ? "Your payment has been processed successfully."
                  : isCanceled
                  ? "The payment was canceled. No charges were made."
                  : "Your payment is being processed."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Invoice ID: {invoice.id}</CardDescription>
            </div>
            <Badge
              variant={
                invoice.status === "PAID"
                  ? "default"
                  : invoice.status === "FAILED"
                  ? "destructive"
                  : "secondary"
              }
              className="text-sm px-3 py-1"
            >
              {invoice.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-2xl font-bold text-slate-900">
                ${(invoice.amount / 100).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(invoice.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Fee Breakdown */}
          {invoice.commissionAmount && (
            <div className="border-t pt-4 space-y-2">
              <h3 className="text-sm font-medium">Fee Breakdown</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-medium">${(invoice.amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee (15%)</span>
                <span className="font-medium text-red-600">
                  -${(invoice.commissionAmount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-2 border-t">
                <span>Consultant Payout</span>
                <span className="text-green-600">
                  ${((invoice.amount - invoice.commissionAmount) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Engagement Info */}
          {engagement && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Engagement</h3>
              <p className="font-medium">{engagement.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {engagement.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => router.push("/relay/engagements")}
            >
              <Home className="h-4 w-4 mr-2" />
              View All Engagements
            </Button>
            {isSuccess && (
              <Button onClick={downloadReceipt} className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {isSuccess && (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-indigo-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-indigo-700">
              <li>• The consultant has been notified of your payment</li>
              <li>• You can communicate with the consultant through the engagement page</li>
              <li>• You can create additional invoices for this engagement as needed</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
