"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useOrganization } from "@/lib/organizations/useOrganization";
import { getConsultantById, createEngagement } from "@/lib/relay/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, DollarSign, FileText, User } from "lucide-react";

export default function NewEngagementPage() {
  const router = useRouter();
  const params = useParams();
  const consultantId = params.consultant;
  const { organization } = useOrganization();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultant, setConsultant] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    budget: "",
    deliverables: [] as string[],
  });

  const [newDeliverable, setNewDeliverable] = useState("");

  useEffect(() => {
    async function loadConsultant() {
      if (!consultantId) return;

      try {
        const id = Array.isArray(consultantId) ? consultantId[0] : consultantId;
        const data = await getConsultantById(id);
        if (!data) {
          toast.error("Consultant not found");
          router.push("/relay/consultants");
          return;
        }
        setConsultant(data);
      } catch (error) {
        console.error("Failed to load consultant:", error);
        toast.error("Failed to load consultant information");
      } finally {
        setIsLoading(false);
      }
    }
    loadConsultant();
  }, [consultantId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!organization) {
      toast.error("Please select an organization first");
      return;
    }

    if (!consultant) {
      toast.error("Consultant information not available");
      return;
    }

    setIsSubmitting(true);
    try {
      const engagementId = await createEngagement(
        consultant.id,
        formData.title,
        formData.description,
        organization.id,
        formData.startDate,
        formData.endDate,
        formData.budget ? parseFloat(formData.budget) * 100 : undefined, // Convert to cents
        formData.deliverables.length > 0 ? formData.deliverables : undefined
      );

      toast.success("Engagement created successfully");
      router.push(`/relay/engagements/${engagementId}`);
    } catch (error) {
      console.error("Failed to create engagement:", error);
      toast.error("Failed to create engagement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function addDeliverable() {
    const trimmed = newDeliverable.trim();
    if (trimmed && !formData.deliverables.includes(trimmed)) {
      setFormData({ ...formData, deliverables: [...formData.deliverables, trimmed] });
      setNewDeliverable("");
    }
  }

  function removeDeliverable(index: number) {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== index),
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!consultant) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Initiate Engagement</h1>
        <p className="text-slate-500 mt-1">
          Create a new engagement with {consultant.headline || "this consultant"}
        </p>
      </div>

      {/* Consultant Summary */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{consultant.headline}</h3>
              <p className="text-muted-foreground text-sm mt-1">{consultant.location}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {consultant.expertiseTags?.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Hourly Rate</p>
              <p className="text-lg font-semibold text-indigo-900">
                {consultant.hourlyRate
                  ? `$${(consultant.hourlyRate / 100).toFixed(0)}/hr`
                  : "Contact for rates"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Form */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Details</CardTitle>
          <CardDescription>
            Provide details about the consulting engagement you'd like to initiate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Engagement Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Enrollment Strategy Assessment for Fall 2025"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the scope of work, objectives, and any specific requirements for this engagement..."
                className="min-h-[150px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formData.startDate
                        ? format(formData.startDate, "MMM d, yyyy")
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formData.endDate
                        ? format(formData.endDate, "MMM d, yyyy")
                        : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                      disabled={(date) =>
                        formData.startDate ? date < formData.startDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="budget"
                  type="number"
                  placeholder="5000"
                  className="pl-7"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated budget for the entire engagement. This can be adjusted later.
              </p>
            </div>

            {/* Deliverables */}
            <div className="space-y-2">
              <Label>Expected Deliverables</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Strategy report, Presentation, Implementation plan"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDeliverable();
                    }
                  }}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDeliverable}
                  disabled={isSubmitting || !newDeliverable.trim()}
                >
                  Add
                </Button>
              </div>

              {formData.deliverables.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.deliverables.map((del, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 gap-1"
                    >
                      {del}
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
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
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Engagement
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Note */}
      <Alert className="bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          <strong>What happens next?</strong>
        </p>
        <p className="text-sm text-blue-700 mt-1">
          After creating the engagement, you can create an invoice and process payment
          through Stripe. The consultant will be notified and can begin work once the
          payment is confirmed.
        </p>
      </Alert>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";