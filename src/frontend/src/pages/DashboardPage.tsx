import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Clock,
  LayoutDashboard,
  Loader2,
  MapPin,
  Save,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllMissingPersons,
  useGetGroups,
  useGetUserProfile,
  useSaveUserProfile,
} from "../hooks/useQueries";

const TRACKING_HISTORY = [
  {
    location: "Central Park, NYC",
    time: "Today, 9:42 AM",
    group: "Family Group",
  },
  {
    location: "Grand Central Terminal",
    time: "Yesterday, 6:15 PM",
    group: "Work Team",
  },
  {
    location: "Brooklyn Bridge",
    time: "Yesterday, 11:20 AM",
    group: "Family Group",
  },
  {
    location: "Times Square",
    time: "2 days ago, 3:30 PM",
    group: "Travel Crew",
  },
];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  if (!identity) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <LayoutDashboard className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold">
          Sign In to Access Dashboard
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Your personalized safety dashboard requires authentication.
        </p>
        <Button onClick={login} disabled={isLoggingIn} className="mt-2">
          {isLoggingIn ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: groups = [], isLoading: groupsLoading } = useGetGroups();
  const { data: missingPersons = [] } = useGetAllMissingPersons();
  const saveProfile = useSaveUserProfile();

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    emergencyContact: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        phone: profile.phone,
        emergencyContact: profile.emergencyContact,
      });
    }
  }, [profile]);

  const myReports = missingPersons.filter(
    (p) =>
      identity && p.reporter.toString() === identity.getPrincipal().toString(),
  );

  const handleSaveProfile = async () => {
    try {
      await saveProfile.mutateAsync(profileForm);
      toast.success("Profile saved successfully.");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  return (
    <AuthGate>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, groups, and safety reports.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="d-name">Display Name</Label>
                      <Input
                        id="d-name"
                        placeholder="Your name"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        data-ocid="dashboard.profile_name_input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="d-phone">Phone Number</Label>
                      <Input
                        id="d-phone"
                        placeholder="+1-555-0000"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        data-ocid="dashboard.profile_phone_input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="d-ec">Emergency Contact</Label>
                      <Input
                        id="d-ec"
                        placeholder="Emergency contact number"
                        value={profileForm.emergencyContact}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            emergencyContact: e.target.value,
                          }))
                        }
                        data-ocid="dashboard.profile_emergency_input"
                      />
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saveProfile.isPending}
                      className="w-full"
                      data-ocid="dashboard.profile_save_button"
                    >
                      {saveProfile.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> Save Profile
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Tracking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {TRACKING_HISTORY.map((entry, i) => (
                    <div
                      key={entry.location}
                      data-ocid={`dashboard.item.${i + 1}`}
                      className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{entry.location}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.group} · {entry.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> My Groups
                  {!groupsLoading && (
                    <Badge className="ml-auto" variant="secondary">
                      {groups.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupsLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : groups.length === 0 ? (
                  <div
                    className="text-center py-6"
                    data-ocid="dashboard.empty_state"
                  >
                    <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No groups yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groups.map((group, i) => (
                      <div
                        key={group.id}
                        data-ocid={`dashboard.item.${i + 1}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{group.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {group.groupCode}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {group.members.length} members
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" /> My Reports
                  <Badge className="ml-auto" variant="secondary">
                    {myReports.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myReports.length === 0 ? (
                  <div
                    className="text-center py-6"
                    data-ocid="dashboard.empty_state"
                  >
                    <Shield className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No reports submitted
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myReports.map((person, i) => (
                      <div
                        key={person.id.toString()}
                        data-ocid={`dashboard.item.${i + 1}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{person.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {person.lastSeenLocation.description}
                          </p>
                        </div>
                        <Badge
                          variant={person.status ? "default" : "destructive"}
                          className={
                            person.status
                              ? "bg-accent/20 text-accent border-accent/30"
                              : ""
                          }
                        >
                          {person.status ? "Found" : "Missing"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {identity && (
              <Card className="border-border">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Your Principal ID
                  </p>
                  <p className="font-mono text-xs text-foreground break-all">
                    {identity.getPrincipal().toString()}
                  </p>
                  <Separator className="my-3" />
                  <Badge variant="outline" className="text-xs">
                    Authenticated
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
