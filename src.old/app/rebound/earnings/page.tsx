"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getEarningsStats, getConsultantEngagements } from "@/lib/rebound/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Briefcase,
  Loader2,
  Calendar,
  ArrowUpRight,
  Wallet,
  PiggyBank,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_INFO = {
  INITIATED: {
    label: "Initiated",
    color: "bg-blue-100 text-blue-700",
  },
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-700",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-gray-100 text-gray-700",
  },
  CANCELED: {
    label: "Canceled",
    color: "bg-red-100 text-red-700",
  },
};

export default function ReboundEarningsPage() {
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [engagements, setEngagements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, engagementsData] = await Promise.all([
          getEarningsStats(),
          getConsultantEngagements(),
        ]);
        setStats(statsData);
        setEngagements(engagementsData);
      } catch (error) {
        console.error("Failed to load earnings data:", error);
        toast.error("Failed to load earnings data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Earnings</h1>
        <p className="text-slate-500 mt-1">
          Track your income and payment history
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Wallet className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${((stats?.totalEarnings || 0) / 100).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paid Earnings */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${((stats?.paidEarnings || 0) / 100).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Paid to You</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Earnings */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${((stats?.pendingEarnings || 0) / 100).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Commission */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <PiggyBank className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${((stats?.totalCommission || 0) / 100).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-900">
                  {stats?.engagementCount || 0}
                </p>
                <p className="text-sm text-teal-700">Total Engagements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {stats?.paidInvoiceCount || 0}
                </p>
                <p className="text-sm text-green-700">Paid Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats?.pendingInvoiceCount || 0}
                </p>
                <p className="text-sm text-yellow-700">Pending Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Engagements</CardTitle>
          <CardDescription>
            All your consulting engagements and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {engagements.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No engagements yet</h3>
              <p className="text-muted-foreground mb-4">
                When clients initiate engagements with you, they'll appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engagements.map((engagement) => {
                  const statusInfo = STATUS_INFO[
                    engagement.status as keyof typeof STATUS_INFO
                  ] || STATUS_INFO.INITIATED;

                  return (
                    <TableRow key={engagement.id}>
                      <TableCell>
                        <p className="font-medium">{engagement.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {engagement.description}
                        </p>
                      </TableCell>
                      <TableCell className="font-medium">
                        {engagement.clientName}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} border-0`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {engagement.startDate ? (
                          <div className="text-sm">
                            <div>
                              {format(new Date(engagement.startDate), "MMM d, yyyy")}
                            </div>
                            {engagement.endDate && (
                              <div className="text-muted-foreground">
                                → {format(new Date(engagement.endDate), "MMM d, yyyy")}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {engagement.budget ? (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {(engagement.budget / 100).toFixed(0)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/rebound/engagements/${engagement.id}`)
                          }
                        >
                          View
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-teal-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-teal-900">Understanding Your Earnings</h3>
              <ul className="text-sm text-teal-700 mt-2 space-y-1">
                <li>• <strong>Total Earnings:</strong> All time earnings after platform fees</li>
                <li>• <strong>Paid to You:</strong> Amount that has been paid out</li>
                <li>• <strong>Pending:</strong> Amount awaiting payment or payout</li>
                <li>• <strong>Platform Fees:</strong> 15% fee on all transactions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
