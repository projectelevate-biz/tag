"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEngagementById, getInvoicesForEngagement } from "@/lib/relay/actions";
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
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_INFO = {
  INITIATED: {
    label: "Initiated",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
    description: "Waiting for consultant to accept",
  },
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
    description: "Work is in progress",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-gray-100 text-gray-700",
    icon: CheckCircle2,
    description: "Engagement has been completed",
  },
  CANCELED: {
    label: "Canceled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
    description: "Engagement was canceled",
  },
};

export default function RelayEngagementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const engagementId = params.id as string;

  const [engagement, setEngagement] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [engagementData, invoicesData] = await Promise.all([
          getEngagementById(engagementId),
          getInvoicesForEngagement(engagementId),
        ]);

        if (!engagementData) {
          toast.error("Engagement not found");
          router.push("/relay/engagements");
          return;
        }

        setEngagement(engagementData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Failed to load engagement:", error);
        toast.error("Failed to load engagement details");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [engagementId, router]);

  function createInvoice() {
    router.push(`/relay/engagements/${engagementId}/invoice`);
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

  const statusInfo = STATUS_INFO[
    engagement.status as keyof typeof STATUS_INFO
  ] || STATUS_INFO.INITIATED;
  const StatusIcon = statusInfo.icon;

  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Engagements
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {engagement.title}
          </h1>
          <p className="text-slate-500 mt-1">Engagement ID: {engagement.id}</p>
        </div>
        <Badge className={`${statusInfo.color} border-0 px-3 py-1.5`}>
          <StatusIcon className="h-4 w-4 mr-1.5" />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {engagement.budget
                    ? `$${(engagement.budget / 100).toFixed(0)}`
                    : "Not set"}
                </p>
                <p className="text-sm text-muted-foreground">Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${(totalPaid / 100).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${(totalPending / 100).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Details */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap">
              {engagement.description || "No description provided."}
            </p>
          </div>

          {/* Consultant Info */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Consultant
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium">{engagement.consultantHeadline}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {engagement.consultantLocation || "Location not specified"}
                </div>
              </div>
              {engagement.consultantHourlyRate && (
                <Badge variant="outline" className="ml-auto">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ${(engagement.consultantHourlyRate / 100).toFixed(0)}/hr
                </Badge>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Timeline
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {engagement.startDate ? (
                    <>
                      <span className="font-medium">Start:</span>{" "}
                      {format(new Date(engagement.startDate), "MMM d, yyyy")}
                    </>
                  ) : (
                    "Start date not set"
                  )}
                </span>
              </div>
              {engagement.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">End:</span>{" "}
                    {format(new Date(engagement.endDate), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Deliverables */}
          {engagement.deliverables && engagement.deliverables.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Expected Deliverables
              </h3>
              <ul className="space-y-2">
                {engagement.deliverables.map((del: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{del}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Payment history and pending invoices
              </CardDescription>
            </div>
            <Button
              onClick={createInvoice}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={engagement.status === "CANCELED"}
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No invoices yet</p>
              <p className="text-sm mt-1">
                Create an invoice to process payment for this engagement
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      ${(invoice.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {invoice.commissionAmount && (
                      <span className="text-sm text-muted-foreground">
                        Platform fee: ${(invoice.commissionAmount / 100).toFixed(2)}
                      </span>
                    )}
                    <Badge
                      variant={
                        invoice.status === "PAID"
                          ? "default"
                          : invoice.status === "FAILED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
