import { ConsultantProfileForm } from "@/components/forms/consultant-profile-form";
import { submitConsultantProfile } from "@/lib/rebound/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";
import { getConsultantProfile } from "@/lib/rebound/actions";

async function submitProfileAction(formData: FormData) {
  "use server";

  try {
    await submitConsultantProfile();
  } catch (error) {
    console.error("Failed to submit profile:", error);
  }
}

export default async function ReboundProfilePage() {
  const profile = await getConsultantProfile();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">
          Manage your consultant profile and visibility in the marketplace
        </p>
      </div>

      {/* Status-specific messaging */}
      {profile?.status === "DRAFT" && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Complete your profile</AlertTitle>
          <AlertDescription className="text-blue-700">
            Fill out all sections of your profile, then submit it for review. Once
            approved, your profile will be visible to institutions.
          </AlertDescription>
        </Alert>
      )}

      {profile?.status === "SUBMITTED" && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">Profile under review</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your profile has been submitted and is being reviewed. You will be notified
            once it has been approved.
          </AlertDescription>
        </Alert>
      )}

      {profile?.status === "ACTIVE" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Profile is live</AlertTitle>
          <AlertDescription className="text-green-700">
            Congratulations! Your profile is approved and visible to institutions.
            You can update your information at any time.
          </AlertDescription>
        </Alert>
      )}

      {profile?.status === "REJECTED" && (
        <Alert className="bg-red-50 border-red-200">
          <Info className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Profile not approved</AlertTitle>
          <AlertDescription className="text-red-700">
            Your profile was not approved. Please review the feedback and make
            necessary changes before resubmitting.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            This information will be visible to institutions searching for consultants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConsultantProfileForm />
        </CardContent>
      </Card>

      {/* Submit Section */}
      {profile?.status === "DRAFT" && (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle>Ready to go live?</CardTitle>
            <CardDescription>
              Submit your profile for review. Once approved, it will be visible to
              institutions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitProfileAction}>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
              >
                Submit Profile for Review
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
