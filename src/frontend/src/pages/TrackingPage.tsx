import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCheck,
  Copy,
  LogIn,
  MapPin,
  Navigation,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Group } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateGroup,
  useGetGroupMembers,
  useGetGroups,
  useJoinGroup,
  useUpdateLocation,
} from "../hooks/useQueries";

const GRID_LINES = [1, 2, 3, 4, 5, 6];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  if (!identity) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold">
          Sign in to Track Your Group
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Authentication required to access live group tracking features.
        </p>
        <Button onClick={login} disabled={isLoggingIn} className="mt-2">
          {isLoggingIn ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}

function SimulatedMap({
  members,
}: {
  members: Array<{ name: string; active: boolean; x: number; y: number }>;
}) {
  return (
    <div className="relative w-full h-full map-grid rounded-xl overflow-hidden bg-secondary/40">
      <div className="absolute inset-0 opacity-20">
        {GRID_LINES.map((n) => (
          <div
            key={`h-${n}`}
            className="absolute border-b border-primary/30"
            style={{ top: `${n * 16.66}%`, left: 0, right: 0 }}
          />
        ))}
        {GRID_LINES.map((n) => (
          <div
            key={`v-${n}`}
            className="absolute border-r border-primary/30"
            style={{ left: `${n * 16.66}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>
      {members.map((m) => (
        <div
          key={m.name}
          data-ocid="tracking.map_marker"
          className="absolute flex flex-col items-center gap-1"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${m.active ? "bg-accent pulse-dot" : "bg-muted-foreground"}`}
          />
          <span className="text-[10px] font-semibold bg-background/90 px-1.5 py-0.5 rounded shadow text-foreground whitespace-nowrap">
            {m.name}
          </span>
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <div className="w-16 h-16 rounded-full border border-primary/20 absolute -inset-7" />
      </div>
      <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Simulated Map View
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: groups = [], isLoading: groupsLoading } = useGetGroups();
  const { data: members = [], isLoading: membersLoading } = useGetGroupMembers(
    selectedGroup?.id ?? null,
  );
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();
  const updateLocation = useUpdateLocation();

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    try {
      const groupId = await createGroup.mutateAsync(groupName.trim());
      setCreatedCode(groupId);
      setGroupName("");
      toast.success("Group created! Share the code with your members.");
    } catch {
      toast.error("Failed to create group.");
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !joinName.trim()) return;
    try {
      const group = await joinGroup.mutateAsync({
        code: joinCode.trim(),
        name: joinName.trim(),
      });
      setSelectedGroup(group);
      setJoinCode("");
      setJoinName("");
      toast.success(`Joined group: ${group.name}`);
    } catch {
      toast.error("Failed to join group. Check the code and try again.");
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedGroup) return;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
        }),
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      await updateLocation.mutateAsync({
        groupId: selectedGroup.id,
        lat,
        lng,
        description: `Updated at ${new Date().toLocaleTimeString()}`,
      });
      toast.success("Location updated successfully.");
    } catch {
      toast.error("Could not get location. Please enable GPS.");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mapMembers = members.map((m, i) => ({
    name: m.name,
    active: m.active,
    x: 20 + (i % 4) * 20 + Math.sin(i) * 10,
    y: 25 + Math.floor(i / 4) * 30 + Math.cos(i) * 10,
  }));

  return (
    <AuthGate>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Live Group Tracking
          </h1>
          <p className="text-muted-foreground">
            Monitor your group in real time and share your location instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="flex flex-col gap-4">
            <div className="h-[420px] md:h-[520px]">
              {selectedGroup ? (
                membersLoading ? (
                  <Skeleton
                    className="w-full h-full rounded-xl"
                    data-ocid="tracking.loading_state"
                  />
                ) : (
                  <SimulatedMap members={mapMembers} />
                )
              ) : (
                <div
                  className="w-full h-full rounded-xl map-grid bg-secondary/40 flex items-center justify-center"
                  data-ocid="tracking.empty_state"
                >
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">
                      Select a group to view member locations
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selectedGroup && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-display">
                      {selectedGroup.name} — {members.length} members
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUpdateLocation}
                      disabled={updateLocation.isPending}
                      data-ocid="tracking.primary_button"
                    >
                      {updateLocation.isPending ? (
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Navigation className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Update My Location
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : members.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No members yet. Share the group code!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((m, i) => (
                        <div
                          key={m.userId.toString()}
                          data-ocid={`tracking.item.${i + 1}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.active ? "bg-accent" : "bg-muted-foreground"}`}
                            />
                            <div>
                              <p className="font-medium text-sm">{m.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {m.location
                                  ? m.location.description
                                  : "Location unknown"}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={m.active ? "default" : "secondary"}
                            className={
                              m.active
                                ? "bg-accent/20 text-accent border-accent/30"
                                : ""
                            }
                          >
                            {m.active ? "Active" : "Offline"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Create Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  data-ocid="tracking.create_group_input"
                />
                {createdCode && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Group Code
                      </p>
                      <p className="font-mono font-bold text-accent text-sm">
                        {createdCode}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-8 w-8"
                      onClick={() => copyCode(createdCode)}
                    >
                      {copied ? (
                        <CheckCheck className="w-4 h-4 text-accent" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={createGroup.isPending || !groupName.trim()}
                  data-ocid="tracking.create_group_button"
                >
                  {createGroup.isPending ? "Creating..." : "Create Group"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-primary" /> Join Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Group code..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  data-ocid="tracking.join_group_input"
                />
                <Input
                  placeholder="Your display name..."
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                />
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleJoin}
                  disabled={
                    joinGroup.isPending || !joinCode.trim() || !joinName.trim()
                  }
                  data-ocid="tracking.join_group_button"
                >
                  {joinGroup.isPending ? "Joining..." : "Join Group"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> My Groups
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
                  <p
                    className="text-sm text-muted-foreground text-center py-4"
                    data-ocid="tracking.empty_state"
                  >
                    No groups yet. Create or join one!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {groups.map((group, i) => (
                      <button
                        type="button"
                        key={group.id}
                        data-ocid={`tracking.item.${i + 1}`}
                        onClick={() => setSelectedGroup(group)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedGroup?.id === group.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-secondary/50"
                        }`}
                      >
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {group.groupCode}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
