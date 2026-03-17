import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Char "mo:core/Char";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";

actor {
  include MixinStorage();

  type Location = {
    lat : Float;
    lng : Float;
    description : Text;
    timestamp : Int;
  };

  type GroupMember = {
    userId : Principal;
    name : Text;
    status : Text;
    location : ?Location;
    active : Bool;
  };

  type Group = {
    id : Text;
    name : Text;
    creator : Principal;
    members : [GroupMember];
    groupCode : Text;
  };

  type MissingPerson = {
    id : Nat;
    name : Text;
    lastSeenLocation : Location;
    description : Text;
    emergencyContact : Text;
    photo : ?Storage.ExternalBlob;
    status : Bool;
    reporter : Principal;
    lastSeen : Int;
  };

  type SOSAlert = {
    id : Nat;
    user : Principal;
    message : Text;
    location : ?Location;
    active : Bool;
    timestamp : Int;
  };

  type UserProfile = {
    name : Text;
    phone : Text;
    emergencyContact : Text;
  };

  module SOSAlert {
    public func compareById(a : SOSAlert, b : SOSAlert) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module MissingPerson {
    public func compareById(a : MissingPerson, b : MissingPerson) : Order.Order {
      Nat.compare(a.id, b.id);
    };

    public func compareByName(a : MissingPerson, b : MissingPerson) : Order.Order {
      a.name.compare(b.name);
    };
  };

  let groups = Map.empty<Text, Group>();
  let missingPersons = Map.empty<Nat, MissingPerson>();
  let activeSOSAlerts = Map.empty<Nat, SOSAlert>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextMissingPersonId = 1;
  var nextSOSAlertId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Group Management
  public shared ({ caller }) func createGroup(name : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create groups");
    };
    let groupId = groups.size().toText();
    let groupCode = caller.toText();
    let newGroup : Group = {
      id = groupId;
      name;
      creator = caller;
      members = [];
      groupCode;
    };
    groups.add(groupId, newGroup);
    groupId;
  };

  public query ({ caller }) func getGroups() : async [Group] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view groups");
    };
    groups.values().toArray();
  };

  public query ({ caller }) func getGroup(groupId : Text) : async Group {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view groups");
    };
    switch (groups.get(groupId)) {
      case (?group) { group };
      case (null) { Runtime.trap("Group not found") };
    };
  };

  public shared ({ caller }) func joinGroup(groupCode : Text, name : Text) : async Group {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join groups");
    };
    var groupToUpdate : ?Group = null;
    groups.forEach(
      func(_id, g) {
        if (g.groupCode == groupCode) { groupToUpdate := ?g };
      }
    );
    switch (groupToUpdate) {
      case (?group) {
        let membersList = List.fromArray<GroupMember>(group.members);
        let newMember : GroupMember = {
          userId = caller;
          name;
          status = "active";
          location = null;
          active = true;
        };

        let filteredMembers = membersList.filter(func(member) { member.userId != newMember.userId });
        filteredMembers.add(newMember);
        let updatedMembers = filteredMembers.toArray();

        let updatedGroup : Group = {
          group with members = updatedMembers;
        };
        groups.add(group.id, updatedGroup);
        updatedGroup;
      };
      case (null) {
        Runtime.trap("Invalid group code");
      };
    };
  };

  public shared ({ caller }) func updateLocation(groupId : Text, lat : Float, lng : Float, description : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update location");
    };
    switch (groups.get(groupId)) {
      case (?group) {
        // Verify caller is a member of the group
        let isMember = group.members.find(func(member) { member.userId == caller });
        if (isMember == null) {
          Runtime.trap("Unauthorized: You must be a member of this group");
        };

        let updatedMembers = group.members.map(
          func(member) {
            if (member.userId == caller) {
              {
                member with status = "updated";
                location = ?{
                  lat;
                  lng;
                  description;
                  timestamp = Time.now();
                };
                active = true;
              };
            } else { member };
          }
        );
        let updatedGroup : Group = {
          group with members = updatedMembers;
        };
        groups.add(groupId, updatedGroup);
        true;
      };
      case (null) { Runtime.trap("Group not found") };
    };
  };

  public query ({ caller }) func getGroupMembers(groupId : Text) : async [GroupMember] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view group members");
    };
    switch (groups.get(groupId)) {
      case (?group) {
        // Verify caller is a member of the group or admin
        let isMember = group.members.find(func(member) { member.userId == caller });
        if (isMember == null and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You must be a member of this group");
        };
        group.members;
      };
      case (null) { Runtime.trap("Group not found") };
    };
  };

  // Missing Person Reports
  public shared ({ caller }) func reportMissingPerson(name : Text, lat : Float, lng : Float, description : Text, emergencyContact : Text, photo : ?Storage.ExternalBlob) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can report missing persons");
    };
    let mp : MissingPerson = {
      id = nextMissingPersonId;
      name;
      lastSeenLocation = { lat; lng; description; timestamp = Time.now() };
      description;
      emergencyContact;
      photo;
      status = false;
      reporter = caller;
      lastSeen = Time.now();
    };

    missingPersons.add(mp.id, mp);
    nextMissingPersonId += 1;
    mp.id;
  };

  public query ({ caller }) func searchMissingPersonsByName(search : Text) : async [MissingPerson] {
    // Public information - anyone can search
    let filtered = missingPersons.filter(
      func(_, mp) {
        let lowerName = mp.name.map(func(c) { if (c >= 'A' and c <= 'Z') { Char.fromNat32(c.toNat32() + 32) } else { c } });
        let lowerSearch = search.map(func(c) { if (c >= 'A' and c <= 'Z') { Char.fromNat32(c.toNat32() + 32) } else { c } });
        lowerName.contains(#text lowerSearch);
      }
    );
    filtered.values().toArray();
  };

  public query ({ caller }) func getAllMissingPersons() : async [MissingPerson] {
    // Public information - anyone can view
    let missingArray = missingPersons.values().toArray();
    missingArray.sort(MissingPerson.compareById);
  };

  public query ({ caller }) func getMissingPerson(id : Nat) : async ?MissingPerson {
    // Public information - anyone can view
    missingPersons.get(id);
  };

  public shared ({ caller }) func markMissingPersonFound(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark missing persons as found");
    };
    switch (missingPersons.get(id)) {
      case (?mp) {
        // Only the reporter or admin can mark as found
        if (mp.reporter != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the reporter or admin can mark this person as found");
        };
        missingPersons.add(id, { mp with status = true });
        true;
      };
      case (null) { Runtime.trap("Record not found") };
    };
  };

  // SOS Alerts
  public shared ({ caller }) func triggerSOSAlert(message : Text, lat : ?Float, lng : ?Float, description : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can trigger SOS alerts");
    };
    let location = switch (lat, lng, description) {
      case (?lat, ?lng, ?description) {
        ?{
          lat;
          lng;
          description;
          timestamp = Time.now();
        };
      };
      case (_) { null };
    };

    let alert : SOSAlert = {
      id = nextSOSAlertId;
      user = caller;
      message;
      location;
      active = true;
      timestamp = Time.now();
    };

    activeSOSAlerts.add(alert.id, alert);
    nextSOSAlertId += 1;
    alert.id;
  };

  public shared ({ caller }) func resolveSOSAlert(alertId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can resolve SOS alerts");
    };
    switch (activeSOSAlerts.get(alertId)) {
      case (?alert) {
        // Only the alert creator or admin can resolve it
        if (alert.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the alert creator or admin can resolve this alert");
        };
        activeSOSAlerts.add(alertId, { alert with active = false });
        true;
      };
      case (null) { Runtime.trap("Alert not found") };
    };
  };

  public query ({ caller }) func getActiveSOSAlerts() : async [SOSAlert] {
    // Public safety information - anyone can view active alerts
    let filtered = activeSOSAlerts.filter(
      func(_, alert) {
        alert.active;
      }
    );
    filtered.values().toArray();
  };
};
