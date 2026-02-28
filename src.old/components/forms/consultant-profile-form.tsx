"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getConsultantProfile, upsertConsultantProfile } from "@/lib/rebound/actions";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Camera, Upload, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Predefined expertise areas for higher education consulting
const EXPERTISE_OPTIONS = [
  "Admissions Strategy",
  "Enrollment Management",
  "DEI Initiatives",
  "Student Success",
  "Financial Aid",
  "Accreditation",
  "International Recruitment",
  "Curriculum Development",
  "Faculty Development",
  "Institutional Research",
  "Strategic Planning",
  " advancement/Fundraising",
  "Marketing & Communications",
  "Online Learning",
  "Athletics Administration",
  "Student Affairs",
  "Academic Affairs",
  "Business Office/Finance",
  "Registrar Services",
  "Career Services",
];

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available - Open to new engagements" },
  { value: "busy", label: "Busy - Limited availability" },
  { value: "unavailable", label: "Unavailable - Not accepting new work" },
];

// Common timezone list for US and international
const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const formSchema = z.object({
  headline: z
    .string()
    .min(10, "Headline must be at least 10 characters")
    .max(100, "Headline must not exceed 100 characters"),
  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters")
    .max(2000, "Bio must not exceed 2000 characters"),
  location: z
    .string()
    .min(2, "Location is required")
    .max(100, "Location must not exceed 100 characters"),
  expertiseTags: z
    .array(z.string())
    .min(1, "Select at least one area of expertise")
    .max(8, "Select up to 8 areas of expertise"),
  hourlyRate: z
    .number()
    .min(50, "Minimum hourly rate is $50")
    .max(1000, "Maximum hourly rate is $1000")
    .optional(),
  availability: z.enum(["available", "busy", "unavailable"]).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  // New MVP fields
  yearsOfExperience: z
    .number()
    .min(0, "Years cannot be negative")
    .max(50, "Maximum 50 years")
    .default(0),
  timezone: z.string().optional(),
  travelOpen: z.boolean().default(false),
  languages: z.array(z.string()).optional(),
  profileSlug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must not exceed 50 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed")
    .optional(),
});

interface ConsultantProfileFormProps {
  onSuccess?: () => void;
  submitDisabled?: boolean;
}

export function ConsultantProfileForm({
  onSuccess,
  submitDisabled = false,
}: ConsultantProfileFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [tagInput, setTagInput] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headline: "",
      bio: "",
      location: "",
      expertiseTags: [],
      hourlyRate: undefined,
      availability: "available",
      website: "",
      linkedin: "",
      yearsOfExperience: 0,
      timezone: "",
      travelOpen: false,
      languages: [],
      profileSlug: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getConsultantProfile();
        if (data) {
          setProfile(data);
          setProfileImage(data.profileImage || null);
          form.reset({
            headline: data.headline || "",
            bio: data.bio || "",
            location: data.location || "",
            expertiseTags: data.expertiseTags || [],
            hourlyRate: data.hourlyRate ? data.hourlyRate / 100 : undefined,
            availability: (data.availability || "available") as "available" | "busy" | "unavailable",
            website: data.website || "",
            linkedin: data.linkedin || "",
            yearsOfExperience: data.yearsOfExperience || 0,
            timezone: data.timezone || "",
            travelOpen: data.travelOpen || false,
            languages: data.languages || [],
            profileSlug: data.profileSlug || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await upsertConsultantProfile({
        headline: values.headline,
        bio: values.bio,
        location: values.location,
        expertiseTags: values.expertiseTags,
        hourlyRate: values.hourlyRate ? Math.round(values.hourlyRate * 100) : undefined,
        availability: values.availability,
        website: values.website || undefined,
        linkedin: values.linkedin || undefined,
        yearsOfExperience: values.yearsOfExperience,
        timezone: values.timezone,
        travelOpen: values.travelOpen,
        languages: values.languages,
        profileSlug: values.profileSlug,
      });
      toast.success("Profile saved successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const addTag = (tag: string) => {
    const currentTags = form.getValues("expertiseTags");
    if (!currentTags.includes(tag) && currentTags.length < 8) {
      form.setValue("expertiseTags", [...currentTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("expertiseTags");
    form.setValue(
      "expertiseTags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.getValues("expertiseTags").includes(trimmed)) {
      addTag(trimmed);
      setTagInput("");
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/rebound/profile-picture", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setProfileImage(data.url);
      toast.success("Profile picture updated successfully");
    } catch (error: any) {
      console.error("Profile picture upload error:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfilePictureDelete = async () => {
    setIsUploadingImage(true);
    try {
      const response = await fetch("/api/rebound/profile-picture", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setProfileImage(null);
      toast.success("Profile picture removed");
    } catch (error: any) {
      console.error("Profile picture delete error:", error);
      toast.error("Failed to remove profile picture");
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="space-y-4">
          <div className="h-24 bg-slate-200 rounded" />
          <div className="h-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  const isReadOnly = profile?.status === "SUBMITTED" || profile?.status === "ACTIVE";

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Status Banner */}
          {profile?.status && (
            <div
              className={`p-4 rounded-lg border ${
                profile.status === "ACTIVE"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : profile.status === "SUBMITTED"
                  ? "bg-blue-50 border-blue-200 text-blue-800"
                  : profile.status === "REJECTED"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-gray-50 border-gray-200 text-gray-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    Profile Status: <span className="uppercase">{profile.status}</span>
                  </p>
                  {isReadOnly && (
                    <p className="text-sm mt-1">
                      {profile.status === "ACTIVE"
                        ? "Your profile is live and visible to institutions."
                        : "Your profile is under review. You'll be notified once it's approved."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="flex items-start gap-6 p-6 border rounded-lg bg-slate-50">
            <div className="relative">
              {profileImage ? (
                <>
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={handleProfilePictureDelete}
                      disabled={isUploadingImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md flex items-center justify-center">
                  <Camera className="h-8 w-8 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Profile Picture</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Add a professional photo to help institutions recognize you.
                Recommended: Square image, at least 200x200px.
              </p>
              {!isReadOnly && (
                <div className="flex items-center gap-3">
                  <label htmlFor="profile-picture-upload">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingImage}
                      asChild
                    >
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploadingImage ? "Uploading..." : "Upload Photo"}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleProfilePictureUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Headline */}
          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Headline</FormLabel>
                <FormDescription>
                  A brief, impactful title that describes your expertise (e.g., "Former
                  Admissions Officer | Enrollment Strategy Consultant")
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Former Admissions Officer | Enrollment Strategy Consultant"
                    disabled={isSubmitting || isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Bio</FormLabel>
                <FormDescription>
                  Tell institutions about your background, experience, and the value you
                  bring. This will be visible on your public profile.
                </FormDescription>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe your professional background, areas of expertise, notable achievements, and what types of engagements you're best suited for..."
                    className="min-h-[200px]"
                    disabled={isSubmitting || isReadOnly}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormMessage />
                  <span className="text-xs text-muted-foreground">
                    {field.value.length} / 2000
                  </span>
                </div>
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormDescription>
                  Your city, state, or country. Helps institutions find local consultants
                  or understand your time zone.
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Boston, MA or United Kingdom"
                    disabled={isSubmitting || isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Years of Experience */}
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormDescription>
                  Total years of experience in higher education administration.
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseInt(value) : 0);
                    }}
                    value={field.value || 0}
                    placeholder="15"
                    disabled={isSubmitting || isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Timezone */}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormDescription>
                  Your primary timezone for scheduling meetings.
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting || isReadOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Travel Openness */}
          <FormField
            control={form.control}
            name="travelOpen"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Open to Travel</FormLabel>
                  <FormDescription>
                    Indicate if you're available for on-site consultations and campus visits.
                  </FormDescription>
                </div>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting || isReadOnly}
                    className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Languages */}
          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Languages (Optional)</FormLabel>
                <FormDescription>
                  Languages you speak fluently beyond English.
                </FormDescription>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {field.value?.map((lang) => (
                      <Badge
                        key={lang}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                      >
                        {lang}
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => {
                              form.setValue(
                                "languages",
                                field.value?.filter((l) => l !== lang) || []
                              );
                            }}
                            className="ml-1 hover:text-purple-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {(!field.value || field.value.length === 0) && (
                      <span className="text-sm text-muted-foreground">
                        No languages added yet.
                      </span>
                    )}
                  </div>
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add language (e.g., Spanish, Mandarin)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const trimmed = tagInput.trim();
                            if (trimmed && !field.value?.includes(trimmed)) {
                              form.setValue("languages", [...(field.value || []), trimmed]);
                              setTagInput("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const trimmed = tagInput.trim();
                          if (trimmed && !field.value?.includes(trimmed)) {
                            form.setValue("languages", [...(field.value || []), trimmed]);
                            setTagInput("");
                          }
                        }}
                        disabled={!tagInput.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Profile Slug */}
          <FormField
            control={form.control}
            name="profileSlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile URL Slug</FormLabel>
                <FormDescription>
                  Create a custom URL for your public profile (e.g., "john-smith").
                  This will be used to share your profile with institutions.
                </FormDescription>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    /consultants/
                  </span>
                  <Input
                    {...field}
                    placeholder="john-smith"
                    className="pl-20"
                    disabled={isSubmitting || isReadOnly}
                    onChange={(e) => {
                      // Convert to lowercase and replace invalid chars
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-")
                        .replace(/^-|-$/g, "");
                      field.onChange(slug);
                    }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expertise Tags */}
          <FormField
            control={form.control}
            name="expertiseTags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Areas of Expertise</FormLabel>
                <FormDescription>
                  Select up to 8 areas where you have specialized knowledge and experience.
                </FormDescription>
                <div className="space-y-4">
                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-slate-50">
                    {field.value.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 gap-1 bg-teal-100 text-teal-700 hover:bg-teal-200"
                      >
                        {tag}
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-teal-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {field.value.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        No expertise selected. Choose from the options below.
                      </span>
                    )}
                  </div>

                  {/* Quick Select Options */}
                  {!isReadOnly && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Quick Select:</p>
                      <div className="flex flex-wrap gap-2">
                        {EXPERTISE_OPTIONS.map((option) => (
                          <Button
                            key={option}
                            type="button"
                            variant={field.value.includes(option) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (field.value.includes(option)) {
                                removeTag(option);
                              } else if (field.value.length < 8) {
                                addTag(option);
                              }
                            }}
                            disabled={
                              field.value.length >= 8 && !field.value.includes(option)
                            }
                            className={
                              field.value.includes(option)
                                ? "bg-teal-600 hover:bg-teal-700"
                                : ""
                            }
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Tag Input */}
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add custom expertise..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomTag();
                          }
                        }}
                        disabled={field.value.length >= 8}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddCustomTag}
                        disabled={field.value.length >= 8 || !tagInput.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hourly Rate */}
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate (USD)</FormLabel>
                <FormDescription>
                  Your typical hourly rate in USD. This helps institutions understand your
                  pricing. You can negotiate specific rates for each engagement.
                </FormDescription>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseFloat(value) : undefined);
                    }}
                    value={field.value || ""}
                    placeholder="150"
                    className="pl-7"
                    disabled={isSubmitting || isReadOnly}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    /hour
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Availability */}
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability Status</FormLabel>
                <FormDescription>
                  Let institutions know your current availability for new engagements.
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting || isReadOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your availability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormDescription>
                  Link to your personal website, portfolio, or blog.
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://yourwebsite.com"
                    disabled={isSubmitting || isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* LinkedIn */}
          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                <FormDescription>
                  Link to your LinkedIn profile for additional verification.
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://linkedin.com/in/yourprofile"
                    disabled={isSubmitting || isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          {!isReadOnly && (
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || submitDisabled}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
              {submitDisabled && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Submit your profile first to enable saving</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Your profile must be submitted and approved before you can make
                      additional changes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </form>
      </Form>
    </TooltipProvider>
  );
}
