"use client";

import { useState, useEffect } from "react";
import { db } from "@/db";
import { documents } from "@/db/schema/rebound-relay";
import { eq } from "drizzle-orm";
import { getConsultantProfile } from "@/lib/rebound/actions";
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
import { FileText, File, Trash2, Upload, X, CheckCircle2, AlertCircle, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DOCUMENT_TYPES = [
  { value: "RESUME", label: "Resume/CV" },
  { value: "CERTIFICATION", label: "Certification" },
  { value: "TRANSCRIPT", label: "Transcript" },
  { value: "PORTFOLIO", label: "Portfolio" },
  { value: "OTHER", label: "Other" },
];

interface Document {
  id: string;
  type: string;
  s3Key: string;
  originalFilename: string;
  createdAt: Date | string;
}

export default function ReboundDocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const profileData = await getConsultantProfile();
        setProfile(profileData);

        if (profileData) {
          const response = await fetch("/api/rebound/documents");
          if (response.ok) {
            const data = await response.json();
            setDocs(data.documents || []);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleDocumentUpload() {
    if (!selectedFile || !selectedDocType) {
      toast.error("Please select a document type and upload a file");
      return;
    }

    setIsUploading(true);
    try {
      // Create FormData and upload to Supabase
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/rebound/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();

      // Now save document metadata to database
      const response = await fetch("/api/rebound/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedDocType,
          s3Key: uploadData.path, // Store Supabase storage path
          originalFilename: selectedFile.name,
        }),
      });

      if (response.ok) {
        toast.success("Document uploaded successfully");
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setSelectedDocType("");

        // Reload documents
        const docsResponse = await fetch("/api/rebound/documents");
        if (docsResponse.ok) {
          const data = await docsResponse.json();
          setDocs(data.documents || []);
        }
      } else {
        throw new Error("Failed to save document metadata");
      }
    } catch (error: any) {
      console.error("Failed to upload document:", error);
      toast.error(error?.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteDocument(docId: string) {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await fetch(`/api/rebound/documents/${docId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Document deleted successfully");
        const data = await response.json();
        setDocs(data.documents || []);
      } else {
        throw new Error("Failed to delete document");
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    }
  }

  async function handleDownload(doc: Document) {
    setDownloadingDocId(doc.id);
    try {
      // Get signed URL from Supabase
      const response = await fetch(`/api/rebound/upload?path=${encodeURIComponent(doc.s3Key)}`);
      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }

      const data = await response.json();

      // Open the signed URL in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error("Failed to download document:", error);
      toast.error("Failed to download document");
    } finally {
      setDownloadingDocId(null);
    }
  }

  const getDocTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getDocTypeIcon = (type: string) => {
    switch (type) {
      case "RESUME":
        return <FileText className="h-4 w-4" />;
      case "CERTIFICATION":
      case "TRANSCRIPT":
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 mt-1">
            Upload and manage your professional documents
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload your resume, certifications, transcripts, or other relevant
                documents.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Document Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">File</label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX (Max 10MB)
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("File too large. Maximum size is 10MB.");
                            return;
                          }
                          setSelectedFile(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Selected File Preview */}
              {selectedFile && (
                <Alert className="bg-teal-50 border-teal-200">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  <AlertDescription className="text-teal-700 flex items-center justify-between">
                    <span className="truncate flex-1">
                      {selectedFile.name}
                      <span className="text-xs ml-2 text-teal-600">
                        ({formatFileSize(selectedFile.size)})
                      </span>
                    </span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-2 hover:text-teal-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Supported Formats Notice */}
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Supported formats:</p>
                <p>PDF, DOC, DOCX (Max 10MB)</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  setSelectedFile(null);
                  setSelectedDocType("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDocumentUpload}
                disabled={!selectedFile || !selectedDocType || isUploading}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Documents</CardTitle>
          <CardDescription>
            These documents help verify your credentials and expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading documents...
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your resume, certifications, or other relevant documents to
                strengthen your profile.
              </p>
              <Button
                onClick={() => setUploadDialogOpen(true)}
                variant="outline"
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDocTypeIcon(doc.type)}
                        <Badge variant="secondary">{getDocTypeLabel(doc.type)}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{doc.originalFilename}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingDocId === doc.id}
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 mr-1"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">About Your Documents</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm space-y-2">
          <p>
            Documents are stored securely in Supabase Storage and only visible to
            administrators during the approval process
          </p>
          <p>
            Approved consultants can choose to make certain documents visible to
            institutions
          </p>
          <p>
            Keep your resume and certifications up to date to maintain your verified
            status
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
