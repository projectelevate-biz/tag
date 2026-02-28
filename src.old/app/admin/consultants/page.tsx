"use client";

import { useState, useEffect } from "react";
import { getConsultantsForModeration, approveConsultant, rejectConsultant } from "@/lib/admin/actions";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Search, Eye, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "ACTIVE", label: "Active" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DRAFT", label: "Draft" },
];

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

interface Consultant {
  id: string;
  headline: string | null;
  bio: string | null;
  status: string;
  expertiseTags: string[] | null;
  location: string | null;
  hourlyRate: number | null;
  availability: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  userId: string;
  userName: string | null;
  userEmail: string | null;
}

export default function AdminConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewConsultant, setViewConsultant] = useState<Consultant | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    loadConsultants();
  }, [statusFilter, searchQuery]);

  async function loadConsultants() {
    setIsLoading(true);
    try {
      const data = await getConsultantsForModeration({
        status: statusFilter,
        search: searchQuery || undefined,
      });
      setConsultants(data);
    } catch (error) {
      console.error("Failed to load consultants:", error);
      toast.error("Failed to load consultants");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setIsProcessing(true);
    try {
      await approveConsultant(id);
      toast.success("Consultant approved successfully");
      await loadConsultants();
    } catch (error) {
      console.error("Failed to approve consultant:", error);
      toast.error("Failed to approve consultant");
    } finally {
      setIsProcessing(false);
    }
  }

  function openRejectDialog(consultant: Consultant) {
    setSelectedConsultant(consultant);
    setRejectReason("");
    setRejectDialogOpen(true);
  }

  async function handleReject() {
    if (!selectedConsultant) return;

    setIsProcessing(true);
    try {
      await rejectConsultant(selectedConsultant.id, rejectReason);
      toast.success("Consultant rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedConsultant(null);
      await loadConsultants();
    } catch (error) {
      console.error("Failed to reject consultant:", error);
      toast.error("Failed to reject consultant");
    } finally {
      setIsProcessing(false);
    }
  }

  function viewConsultantDetails(consultant: Consultant) {
    setViewConsultant(consultant);
    setViewDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Consultant Moderation</h1>
        <p className="text-slate-500 mt-1">
          Review and approve consultant profiles for the marketplace
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1 max-w-xs">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, headline, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Consultants</CardTitle>
          <CardDescription>
            {consultants.length} consultant{consultants.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : consultants.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No consultants found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Headline</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultants.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{consultant.userName || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">
                          {consultant.userEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{consultant.headline || "—"}</div>
                    </TableCell>
                    <TableCell>{consultant.location || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {consultant.expertiseTags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(consultant.expertiseTags?.length || 0) > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(consultant.expertiseTags?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[consultant.status as keyof typeof statusColors]}
                      >
                        {consultant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {consultant.createdAt ? new Date(consultant.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewConsultantDetails(consultant)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Action Buttons based on status */}
                        {consultant.status === "SUBMITTED" && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(consultant.id)}
                              disabled={isProcessing}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRejectDialog(consultant)}
                              disabled={isProcessing}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Consultant Profile</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. This will be shared with the consultant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              <strong>Consultant:</strong> {selectedConsultant?.userName} (
              {selectedConsultant?.userEmail})
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea
                placeholder="Explain why the profile is being rejected and what changes are needed..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason("");
                setSelectedConsultant(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? "Rejecting..." : "Reject Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultant Profile Details</DialogTitle>
          </DialogHeader>

          {viewConsultant && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{viewConsultant.headline}</h3>
                <p className="text-muted-foreground">{viewConsultant.location}</p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={statusColors[viewConsultant.status as keyof typeof statusColors]}
                  >
                    {viewConsultant.status}
                  </Badge>
                  {viewConsultant.availability && (
                    <Badge variant="outline">{viewConsultant.availability}</Badge>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Bio</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {viewConsultant.bio || "No bio provided"}
                </p>
              </div>

              {/* Expertise */}
              {viewConsultant.expertiseTags && viewConsultant.expertiseTags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewConsultant.expertiseTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Rate */}
              {viewConsultant.hourlyRate && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Hourly Rate</h4>
                  <p className="text-sm">${viewConsultant.hourlyRate / 100}/hour</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Contact Information</h4>
                <p><strong>Name:</strong> {viewConsultant.userName || "N/A"}</p>
                <p><strong>Email:</strong> {viewConsultant.userEmail}</p>
                <p><strong>User ID:</strong> {viewConsultant.userId}</p>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-muted-foreground">
                <p>Created: {viewConsultant.createdAt ? new Date(viewConsultant.createdAt).toLocaleString() : "N/A"}</p>
                <p>Updated: {viewConsultant.updatedAt ? new Date(viewConsultant.updatedAt).toLocaleString() : "N/A"}</p>
              </div>

              {/* Actions for submitted profiles */}
              {viewConsultant.status === "SUBMITTED" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleApprove(viewConsultant.id);
                    }}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setViewDialogOpen(false);
                      openRejectDialog(viewConsultant);
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
