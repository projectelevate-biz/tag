"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/lib/organizations/useOrganization";
import { getEngagementsForClient } from "@/lib/relay/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const STATUS_INFO = {
  INITIATED: {
    label: "Initiated",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
  },
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-gray-100 text-gray-700",
    icon: CheckCircle2,
  },
  CANCELED: {
    label: "Canceled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export default function RelayEngagementsPage() {
  const router = useRouter();
  const { organization } = useOrganization();

  const [engagements, setEngagements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function loadEngagements() {
      if (!organization) return;

      try {
        const data = await getEngagementsForClient(organization.id);
        setEngagements(data);
      } catch (error) {
        console.error("Failed to load engagements:", error);
        toast.error("Failed to load engagements");
      } finally {
        setIsLoading(false);
      }
    }
    loadEngagements();
  }, [organization]);

  const filteredEngagements = engagements.filter((e) =>
    statusFilter === "all" ? true : e.status === statusFilter
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
          <p className="text-muted-foreground">
            Please select an organization to view engagements
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Engagements</h1>
          <p className="text-slate-500 mt-1">
            Manage your consulting engagements with experts
          </p>
        </div>
        <Button
          onClick={() => router.push("/relay/consultants")}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Find Consultants
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {engagements.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Engagements</p>
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
                  {engagements.filter((e) => e.status === "INITIATED").length}
                </p>
                <p className="text-sm text-muted-foreground">Initiated</p>
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
                  {engagements.filter((e) => e.status === "ACTIVE").length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {engagements.filter((e) => e.status === "COMPLETED").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Engagement History</CardTitle>
              <CardDescription>
                All engagements for {organization.name}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="INITIATED">Initiated</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELED">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEngagements.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No engagements yet</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === "all"
                  ? "Start working with consultants by finding the right expert for your needs."
                  : `No ${statusFilter.toLowerCase()} engagements found.`}
              </p>
              {statusFilter === "all" && (
                <Button
                  onClick={() => router.push("/relay/consultants")}
                  variant="outline"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Find Consultants
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEngagements.map((engagement) => {
                  const statusInfo = STATUS_INFO[
                    engagement.status as keyof typeof STATUS_INFO
                  ] || STATUS_INFO.INITIATED;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <TableRow key={engagement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{engagement.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {engagement.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{engagement.consultantHeadline}</p>
                          <p className="text-sm text-muted-foreground">
                            {engagement.consultantLocation || "Location not specified"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} border-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {engagement.startDate ? (
                          <div className="text-sm">
                            <div>{format(new Date(engagement.startDate), "MMM d, yyyy")}</div>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/relay/engagements/${engagement.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/relay/engagements/${engagement.id}/invoice`
                                )
                              }
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Create Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
