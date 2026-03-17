import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { MissingPerson } from "../backend.d";
import {
  useGetActiveSOSAlerts,
  useSearchMissingPersons,
} from "../hooks/useQueries";

function timeAgo(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SAMPLE_MISSING: MissingPerson[] = [
  {
    id: BigInt(1),
    name: "Marcus Rivera",
    status: false,
    description:
      "Last seen wearing blue hoodie and jeans. Has a small scar on left cheek.",
    emergencyContact: "+1-555-0182",
    reporter: { toString: () => "anon" } as never,
    lastSeen: BigInt(Date.now() - 3 * 3600000) * BigInt(1_000_000),
    lastSeenLocation: {
      lat: 40.71,
      lng: -74.0,
      description: "Near Central Station, Platform 3",
      timestamp: BigInt(0),
    },
    photo: undefined,
  },
  {
    id: BigInt(2),
    name: "Elena Park",
    status: false,
    description:
      "Elderly woman, 74 years old, grey hair. Suffers from memory issues. Last seen in the Riverside shopping area.",
    emergencyContact: "+1-555-0293",
    reporter: { toString: () => "anon" } as never,
    lastSeen: BigInt(Date.now() - 8 * 3600000) * BigInt(1_000_000),
    lastSeenLocation: {
      lat: 40.73,
      lng: -73.99,
      description: "Riverside Shopping Mall, East Entrance",
      timestamp: BigInt(0),
    },
    photo: undefined,
  },
  {
    id: BigInt(3),
    name: "Tyler Nguyen",
    status: true,
    description: "Teen, 16 years old. Was located safe at a friend's house.",
    emergencyContact: "+1-555-0341",
    reporter: { toString: () => "anon" } as never,
    lastSeen: BigInt(Date.now() - 2 * 86400000) * BigInt(1_000_000),
    lastSeenLocation: {
      lat: 40.75,
      lng: -74.01,
      description: "Maple Street, Block 14",
      timestamp: BigInt(0),
    },
    photo: undefined,
  },
];

function MissingPersonCard({
  person,
  index,
}: { person: MissingPerson; index: number }) {
  return (
    <Card
      data-ocid={`search.item.${index}`}
      className="border-border shadow-card hover:shadow-card-hover transition-shadow"
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-bold text-lg leading-tight">
                {person.name}
              </h3>
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
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {person.lastSeenLocation.description}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{timeAgo(person.lastSeen)}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {person.description}
            </p>
            <div className="flex items-center gap-1.5 text-sm">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-medium text-primary">
                {person.emergencyContact}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "found">("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: searchResults = [], isLoading: searchLoading } =
    useSearchMissingPersons(debouncedQuery);
  const { data: sosAlerts = [], isLoading: sosLoading } =
    useGetActiveSOSAlerts();

  // Merge real results with samples for demo richness
  const allPersons = searchResults.length > 0 ? searchResults : SAMPLE_MISSING;

  const filtered = allPersons.filter((p) => {
    if (filter === "active") return !p.status;
    if (filter === "found") return p.status;
    return true;
  });

  // Simulated map dots
  const mapDots = filtered.slice(0, 6).map((p, i) => ({
    name: p.name,
    status: p.status,
    x: 15 + (i % 4) * 22,
    y: 25 + Math.floor(i / 4) * 40,
  }));

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
          Search & Alerts
        </h1>
        <p className="text-muted-foreground">
          Find missing persons and view active SOS alerts.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          className="pl-9 h-11"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-ocid="search.search_input"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          {/* Filter Tabs */}
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="all" data-ocid="search.filter_all_tab">
                All Cases
              </TabsTrigger>
              <TabsTrigger value="active" data-ocid="search.filter_active_tab">
                Active Missing
              </TabsTrigger>
              <TabsTrigger value="found" data-ocid="search.filter_found_tab">
                Found
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Results */}
          {searchLoading ? (
            <div className="space-y-4" data-ocid="search.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" data-ocid="search.empty_state">
              <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-muted-foreground">
                No matching cases found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((person, i) => (
                <MissingPersonCard
                  key={person.id.toString()}
                  person={person}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: SOS Alerts + Map */}
        <div className="space-y-4">
          {/* Simulated map */}
          <div className="h-48 rounded-xl map-grid bg-secondary/40 relative overflow-hidden">
            {mapDots.map((dot) => (
              <div
                key={dot.name}
                data-ocid="search.map_marker"
                className="absolute"
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white shadow ${dot.status ? "bg-accent" : "bg-destructive"}`}
                />
              </div>
            ))}
            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
              Map Overview
            </div>
          </div>

          {/* SOS Alerts */}
          <Card className="border-destructive/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h3 className="font-display font-bold text-sm">
                  Active SOS Alerts
                </h3>
                {sosAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {sosAlerts.length}
                  </Badge>
                )}
              </div>
              {sosLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : sosAlerts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No active SOS alerts
                </p>
              ) : (
                <div className="space-y-2">
                  {sosAlerts.map((alert, i) => (
                    <div
                      key={alert.id.toString()}
                      data-ocid={`search.item.${i + 1}`}
                      className="p-3 rounded-lg bg-destructive/8 border border-destructive/20"
                    >
                      <p className="text-xs font-bold text-destructive">
                        {alert.message}
                      </p>
                      {alert.location && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {alert.location.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive" /> Missing
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-accent" /> Found
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
