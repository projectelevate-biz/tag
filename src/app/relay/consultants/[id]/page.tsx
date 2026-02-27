"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getConsultantById } from "@/lib/relay/actions";
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
  MapPin,
  DollarSign,
  Mail,
  Globe,
  Linkedin,
  Calendar,
  Briefcase,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const AVAILABILITY_INFO = {
  available: {
    label: "Available for new work",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  busy: {
    label: "Limited availability",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  unavailable: {
    label: "Currently unavailable",
    color: "bg-gray-100 text-gray-700",
    icon: XCircle,
  },
};

export default function RelayConsultantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const consultantId = params.id as string;

  const [consultant, setConsultant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadConsultant() {
      try {
        const data = await getConsultantById(consultantId);
        if (!data) {
          toast.error("Consultant not found");
          router.push("/relay/consultants");
          return;
        }
        setConsultant(data);
      } catch (error) {
        console.error("Failed to load consultant:", error);
        toast.error("Failed to load consultant profile");
      } finally {
        setIsLoading(false);
      }
    }
    loadConsultant();
  }, [consultantId, router]);

  function initiateEngagement() {
    router.push(`/relay/engagements/new/${consultantId}`);
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

  const availabilityInfo = AVAILABILITY_INFO[
    consultant.availability as keyof typeof AVAILABILITY_INFO
  ] || AVAILABILITY_INFO.unavailable;
  const AvailabilityIcon = availabilityInfo.icon;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Search
      </Button>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {consultant.headline || "Consultant"}
                </h1>
                {consultant.location && (
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{consultant.location}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Availability Badge */}
                <Badge className={`${availabilityInfo.color} border-0`}>
                  <AvailabilityIcon className="h-3 w-3 mr-1" />
                  {availabilityInfo.label}
                </Badge>

                {/* Hourly Rate */}
                {consultant.hourlyRate && (
                  <Badge variant="outline" className="text-indigo-700 border-indigo-200">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ${(consultant.hourlyRate / 100).toFixed(0)}/hr
                  </Badge>
                )}
              </div>

              {/* Contact Links */}
              <div className="flex flex-wrap gap-3">
                {consultant.website && (
                  <a
                    href={consultant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {consultant.linkedin && (
                  <a
                    href={consultant.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <Button
                onClick={initiateEngagement}
                disabled={consultant.availability === "unavailable"}
                className="bg-indigo-600 hover:bg-indigo-700"
                size="lg"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Initiate Engagement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Card */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {consultant.bio || "No bio provided."}
          </p>
        </CardContent>
      </Card>

      {/* Expertise Card */}
      {consultant.expertiseTags && consultant.expertiseTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Areas of Expertise</CardTitle>
            <CardDescription>
              Specialized knowledge and experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {consultant.expertiseTags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-indigo-900">
                Ready to Start Your Project
              </h3>
              <p className="text-sm text-indigo-700 mt-1">
                Click "Initiate Engagement" to begin working with this consultant.
                You'll be able to define project scope, timeline, and budget before
                any payment is processed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
