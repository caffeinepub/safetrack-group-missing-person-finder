import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type {
  Group,
  GroupMember,
  MissingPerson,
  SOSAlert,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

export function useGetGroups() {
  const { actor, isFetching } = useActor();
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGroups();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGroupMembers(groupId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<GroupMember[]>({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      if (!actor || !groupId) return [];
      return actor.getGroupMembers(groupId);
    },
    enabled: !!actor && !isFetching && !!groupId,
  });
}

export function useGetAllMissingPersons() {
  const { actor, isFetching } = useActor();
  return useQuery<MissingPerson[]>({
    queryKey: ["missing-persons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMissingPersons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchMissingPersons(query: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MissingPerson[]>({
    queryKey: ["missing-persons-search", query],
    queryFn: async () => {
      if (!actor) return [];
      if (query.trim()) {
        return actor.searchMissingPersonsByName(query);
      }
      return actor.getAllMissingPersons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveSOSAlerts() {
  const { actor, isFetching } = useActor();
  return useQuery<SOSAlert[]>({
    queryKey: ["sos-alerts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveSOSAlerts();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createGroup(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, name }: { code: string; name: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.joinGroup(code, name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useUpdateLocation() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      groupId,
      lat,
      lng,
      description,
    }: { groupId: string; lat: number; lng: number; description: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateLocation(groupId, lat, lng, description);
    },
  });
}

export function useReportMissingPerson() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      lat: number;
      lng: number;
      description: string;
      emergencyContact: string;
      photoBytes?: Uint8Array<ArrayBuffer>;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      const photo = data.photoBytes
        ? ExternalBlob.fromBytes(data.photoBytes)
        : null;
      return actor.reportMissingPerson(
        data.name,
        data.lat,
        data.lng,
        data.description,
        data.emergencyContact,
        photo,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["missing-persons"] }),
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile"] }),
  });
}

export function useTriggerSOS() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lat,
      lng,
    }: { lat: number | null; lng: number | null }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.triggerSOSAlert(
        "SOS Emergency",
        lat,
        lng,
        "I need immediate help",
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sos-alerts"] }),
  });
}

export function useMarkMissingPersonFound() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.markMissingPersonFound(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["missing-persons"] }),
  });
}
