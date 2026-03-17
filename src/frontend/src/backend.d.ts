import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Location {
    lat: number;
    lng: number;
    description: string;
    timestamp: bigint;
}
export interface GroupMember {
    status: string;
    active: boolean;
    userId: Principal;
    name: string;
    location?: Location;
}
export interface SOSAlert {
    id: bigint;
    active: boolean;
    user: Principal;
    message: string;
    timestamp: bigint;
    location?: Location;
}
export interface Group {
    id: string;
    creator: Principal;
    members: Array<GroupMember>;
    name: string;
    groupCode: string;
}
export interface MissingPerson {
    id: bigint;
    status: boolean;
    name: string;
    emergencyContact: string;
    description: string;
    photo?: ExternalBlob;
    reporter: Principal;
    lastSeen: bigint;
    lastSeenLocation: Location;
}
export interface UserProfile {
    name: string;
    emergencyContact: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGroup(name: string): Promise<string>;
    getActiveSOSAlerts(): Promise<Array<SOSAlert>>;
    getAllMissingPersons(): Promise<Array<MissingPerson>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGroup(groupId: string): Promise<Group>;
    getGroupMembers(groupId: string): Promise<Array<GroupMember>>;
    getGroups(): Promise<Array<Group>>;
    getMissingPerson(id: bigint): Promise<MissingPerson | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinGroup(groupCode: string, name: string): Promise<Group>;
    markMissingPersonFound(id: bigint): Promise<boolean>;
    reportMissingPerson(name: string, lat: number, lng: number, description: string, emergencyContact: string, photo: ExternalBlob | null): Promise<bigint>;
    resolveSOSAlert(alertId: bigint): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchMissingPersonsByName(search: string): Promise<Array<MissingPerson>>;
    triggerSOSAlert(message: string, lat: number | null, lng: number | null, description: string | null): Promise<bigint>;
    updateLocation(groupId: string, lat: number, lng: number, description: string): Promise<boolean>;
}
