import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
  Loader2,
  Phone,
  Shield,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  if (!identity) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-display font-bold">Sign In to Report</h2>
        <p className="text-muted-foreground max-w-sm">
          You need to be signed in to report a missing person.
        </p>
        <Button onClick={login} disabled={isLoggingIn} className="mt-2">
          {isLoggingIn ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}

export default function ReportPage() {
  const { actor } = useActor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportId, setReportId] = useState<bigint | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    lastSeenLocation: "",
    lastSeenTime: "",
    description: "",
    emergencyContact: "",
  });

  const update = (field: string, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!form.name || !form.lastSeenLocation || !form.emergencyContact) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      let photo: ExternalBlob | null = null;
      if (photoFile) {
        const bytes = await new Promise<Uint8Array<ArrayBuffer>>(
          (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) =>
              resolve(
                new Uint8Array(
                  ev.target!.result as ArrayBuffer,
                ) as Uint8Array<ArrayBuffer>,
              );
            reader.onerror = reject;
            reader.readAsArrayBuffer(photoFile);
          },
        );
        photo = ExternalBlob.fromBytes(bytes);
      }
      const id = await actor.reportMissingPerson(
        form.name,
        0,
        0,
        form.description ||
          `Last seen at ${form.lastSeenLocation}. Contact: ${form.emergencyContact}`,
        form.emergencyContact,
        photo,
      );
      setReportId(id);
      toast.success("Missing person report submitted successfully.");
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReportId(null);
    setForm({
      name: "",
      lastSeenLocation: "",
      lastSeenTime: "",
      description: "",
      emergencyContact: "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (reportId !== null) {
    return (
      <AuthGate>
        <div className="container py-16 max-w-xl">
          <div className="text-center" data-ocid="report.success_state">
            <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3">
              Report Submitted
            </h2>
            <p className="text-muted-foreground mb-4">
              Your missing person report has been received and is now active in
              the system.
            </p>
            <div className="p-4 rounded-xl bg-secondary/60 border border-border mb-6">
              <p className="text-sm text-muted-foreground mb-1">Report ID</p>
              <p className="font-mono font-bold text-lg text-primary">
                #{reportId.toString()}
              </p>
            </div>
            <Button onClick={resetForm}>Submit Another Report</Button>
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Report Missing Person
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below to submit an official missing person
            report.
          </p>
        </div>

        <Alert className="mb-6 border-destructive/30 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm">
            <strong>Emergency?</strong> Call <strong>911</strong> immediately.
            For search & rescue: <strong>1-800-843-5678</strong>. For National
            Center for Missing Adults: <strong>1-800-690-3750</strong>.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Person Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="mp-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mp-name"
                  placeholder="e.g. Sarah Johnson"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  data-ocid="report.name_input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo-upload-trigger">Photo</Label>
                <button
                  type="button"
                  id="photo-upload-trigger"
                  className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                  onClick={triggerFileInput}
                  data-ocid="report.upload_button"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-32 w-auto mx-auto rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileImage className="w-10 h-10" />
                      <p className="text-sm font-medium">
                        Click to upload a photo
                      </p>
                      <p className="text-xs">JPG, PNG up to 10MB</p>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                  data-ocid="report.photo_upload"
                />
                {photoFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                  >
                    Remove photo
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mp-location">
                  Last Seen Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mp-location"
                  placeholder="e.g. Central Park, New York"
                  value={form.lastSeenLocation}
                  onChange={(e) => update("lastSeenLocation", e.target.value)}
                  data-ocid="report.location_input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mp-time">Last Seen Date & Time</Label>
                <Input
                  id="mp-time"
                  type="datetime-local"
                  value={form.lastSeenTime}
                  onChange={(e) => update("lastSeenTime", e.target.value)}
                  data-ocid="report.time_input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mp-desc">Description</Label>
                <Textarea
                  id="mp-desc"
                  placeholder="Physical description, clothing, circumstances of disappearance..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  data-ocid="report.description_textarea"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mp-contact">
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  Emergency Contact <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mp-contact"
                  placeholder="Phone number or email"
                  value={form.emergencyContact}
                  onChange={(e) => update("emergencyContact", e.target.value)}
                  data-ocid="report.emergency_input"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={isSubmitting}
                data-ocid="report.submit_button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting
                    Report...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Submit Missing Person
                    Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </AuthGate>
  );
}
