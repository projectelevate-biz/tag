"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEngagementInvoices } from "@/lib/rebound/actions";
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
  Building,
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
    description: "Client has initiated this engagement",
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

export default function ReboundEngagementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const engagementId = params.id as string;

  const [engagement, setEngagement] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch engagement details from API
        const engagementResponse = await fetch(`/api/rebound/engagements/${engagementId}`);
        if (engagementResponse.ok) {
          const data = await engagementResponse.json();
          setEngagement(data.engagement);
        } else {
          toast.error("Failed to load engagement");
          router.push("/rebound/engagements");
          return;
        }

        // Fetch invoices
        const invoicesData = await getEngagementInvoices(engagementId);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
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
    .reduce((sum, i) => sum + i.amount - (i.commissionAmount || 0), 0);
  const totalPending = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((sum, i) => sum + i.amount - (i.commissionAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/rebound/earnings")}
        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Earnings
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
              <div className="p-2 bg-teal-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${((engagement.budget || 0) / 100).toFixed(0)}
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
                <p className="text-sm text-muted-foreground">Paid to You</p>
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

          {/* Client Info */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Client
            </h3>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">{engagement.clientName}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {engagement.startDate && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Timeline
              </h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Start:</span>{" "}
                    {format(new Date(engagement.startDate), "MMM d, yyyy")}
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
          )}

          {/* Deliverables */}
          {engagement.deliverables && engagement.deliverables.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Expected Deliverables
              </h3>
              <ul className="space-y-2">
                {engagement.deliverables.map((del: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
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
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Payment history for this engagement (after 15% platform fee)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No invoices yet</p>
              <p className="text-sm mt-1">
                The client will create invoices as payments are due
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => {
                const yourEarning =
                  invoice.amount - (invoice.commissionAmount || 0);
                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        ${(yourEarning / 100).toFixed(2)} (your earnings)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Total: ${(invoice.amount / 100).toFixed(2)}</p>
                        <p className="text-red-600">
                          Fee: -${((invoice.commissionAmount || 0) / 100).toFixed(2)}
                        </p>
                      </div>
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
