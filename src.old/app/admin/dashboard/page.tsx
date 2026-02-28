"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminStats, getRecentAuditLogs } from "@/lib/admin/actions";
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
  Users,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  UserX,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";

const ACTION_COLORS: Record<string, string> = {
  APPROVAL: "bg-green-100 text-green-700",
  REJECTION: "bg-red-100 text-red-700",
  INVOICE_CREATED: "bg-blue-100 text-blue-700",
  INVOICE_PAID: "bg-green-100 text-green-700",
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, logsData] = await Promise.all([
          getAdminStats(),
          getRecentAuditLogs(20),
        ]);
        setStats(statsData);
        setAuditLogs(logsData);
      } catch (error: any) {
        console.error("Failed to load admin data:", error);
        if (error.message?.includes("Forbidden")) {
          toast.error("You don't have permission to access this page");
          router.push("/");
        } else {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Overview of the Rebound & Relay marketplace
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Consultants */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.activeConsultants}
                </p>
                <p className="text-sm text-muted-foreground">Active Consultants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.submittedConsultants}
                </p>
                <p className="text-sm text-yellow-700">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Engagements */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.activeEngagements}
                </p>
                <p className="text-sm text-muted-foreground">Active Engagements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paid Invoices */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.paidInvoices}
                </p>
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${(stats.totalRevenue / 100).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${(stats.totalCommission / 100).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
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
                  ${(stats.pendingRevenue / 100).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Pending Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Consultants by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Consultants</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Active</span>
                </div>
                <Badge variant="secondary">{stats.activeConsultants}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Submitted (Pending)</span>
                </div>
                <Badge variant="secondary">{stats.submittedConsultants}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Draft</span>
                </div>
                <Badge variant="secondary">{stats.draftConsultants}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Rejected</span>
                </div>
                <Badge variant="secondary">{stats.rejectedConsultants}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagements by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Engagements</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Active</span>
                </div>
                <Badge variant="secondary">{stats.activeEngagements}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Initiated</span>
                </div>
                <Badge variant="secondary">{stats.initiatedEngagements}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Completed</span>
                </div>
                <Badge variant="secondary">{stats.completedEngagements}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Canceled</span>
                </div>
                <Badge variant="secondary">{stats.canceledEngagements}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest admin actions</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/audit")}
            >
              View All
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        className={
                          ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.entityType} ({log.entityId.slice(0, 8)}...)
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.actorName || log.actorEmail || "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/consultants")}
            >
              <Users className="h-4 w-4 mr-2" />
              Review Consultants
            </Button>
            {stats.submittedConsultants > 0 && (
              <Button
                onClick={() => router.push("/admin/consultants?status=SUBMITTED")}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Review {stats.submittedConsultants} Pending
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
