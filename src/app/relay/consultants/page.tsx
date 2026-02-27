"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchConsultants, getExpertiseOptions } from "@/lib/relay/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, DollarSign, User, Briefcase, Filter, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  "Advancement/Fundraising",
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
  { value: "all", label: "All Availability" },
  { value: "available", label: "Available" },
  { value: "busy", label: "Limited" },
  { value: "unavailable", label: "Unavailable" },
];

const RATE_OPTIONS = [
  { value: "all", label: "Any Rate" },
  { value: "0-100", label: "Under $100/hr" },
  { value: "100-200", label: "$100 - $200/hr" },
  { value: "200-300", label: "$200 - $300/hr" },
  { value: "300+", label: "$300+/hr" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "rate-low", label: "Rate: Low to High" },
  { value: "rate-high", label: "Rate: High to Low" },
];

export default function RelayConsultantsPage() {
  const router = useRouter();
  const [consultants, setConsultants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [expertiseOptions, setExpertiseOptions] = useState<string[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [availability, setAvailability] = useState("all");
  const [rateRange, setRateRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Search params state
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    // Load expertise options on mount
    async function loadOptions() {
      try {
        const options = await getExpertiseOptions();
        setExpertiseOptions(options);
      } catch (error) {
        console.error("Failed to load expertise options:", error);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    // Search when filters change
    async function performSearch() {
      setIsSearching(true);
      try {
        let filters: any = {};

        if (debouncedQuery) {
          filters.query = debouncedQuery;
        }

        if (selectedExpertise.length > 0) {
          filters.expertise = selectedExpertise;
        }

        if (availability !== "all") {
          filters.availability = availability;
        }

        if (rateRange !== "all") {
          const [min, max] = rateRange.split("-").map((v) => v === "+" ? Infinity : parseInt(v));
          filters.minRate = min;
          filters.maxRate = max;
        }

        let results = await searchConsultants(filters);

        // Apply sorting
        if (sortBy === "rate-low") {
          results.sort((a, b) => (a.hourlyRate || 999999) - (b.hourlyRate || 999999));
        } else if (sortBy === "rate-high") {
          results.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
        } else if (sortBy === "newest") {
          results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }

        setConsultants(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }
    performSearch();
  }, [debouncedQuery, selectedExpertise, availability, rateRange, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function toggleExpertise(tag: string) {
    if (selectedExpertise.includes(tag)) {
      setSelectedExpertise(selectedExpertise.filter((t) => t !== tag));
    } else {
      setSelectedExpertise([...selectedExpertise, tag]);
    }
  }

  function clearAllFilters() {
    setSearchQuery("");
    setSelectedExpertise([]);
    setAvailability("all");
    setRateRange("all");
    setSortBy("newest");
  }

  const activeFilterCount =
    (debouncedQuery ? 1 : 0) +
    selectedExpertise.length +
    (availability !== "all" ? 1 : 0) +
    (rateRange !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Find Consultants</h1>
        <p className="text-slate-500 mt-1">
          Search our verified network of higher education consulting experts
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, expertise, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={activeFilterCount > 0 ? "border-indigo-200 text-indigo-700" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-indigo-600 text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Sort by: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 space-y-6 border-t pt-6">
              {/* Expertise Filters */}
              <div>
                <h3 className="text-sm font-medium mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_OPTIONS.slice(0, 12).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleExpertise(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedExpertise.includes(tag)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-sm font-medium mb-3">Availability</h3>
                <div className="flex gap-2">
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={availability === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAvailability(option.value)}
                      className={
                        availability === option.value
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : ""
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <h3 className="text-sm font-medium mb-3">Hourly Rate Range</h3>
                <div className="flex gap-2">
                  {RATE_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={rateRange === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRateRange(option.value)}
                      className={
                        rateRange === option.value
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : ""
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : consultants.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No consultants found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearAllFilters} variant="outline">
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {consultants.map((consultant) => (
            <Card
              key={consultant.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/relay/consultants/${consultant.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {consultant.headline || "Consultant"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {consultant.location || "Location not specified"}
                    </div>
                  </div>
                  {consultant.hourlyRate && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-indigo-900">
                        ${(consultant.hourlyRate / 100).toFixed(0)}/hr
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mt-4">
                  {consultant.bio}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {consultant.expertiseTags?.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {(consultant.expertiseTags?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(consultant.expertiseTags?.length || 0) - 3} more
                    </Badge>
                  )}
                </div>

                {consultant.availability && (
                  <div className="mt-4 pt-4 border-t">
                    <Badge
                      variant="secondary"
                      className={
                        consultant.availability === "available"
                          ? "bg-green-100 text-green-700"
                          : consultant.availability === "busy"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }
                    >
                      {consultant.availability === "available"
                        ? "Available for new work"
                        : consultant.availability === "busy"
                          ? "Limited availability"
                          : "Currently unavailable"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
