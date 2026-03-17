# Group Tracking & Missing Person Finder System

## Current State
New project — no existing code.

## Requested Changes (Diff)

### Add
- Home page with hero section, CTA buttons, how-it-works overview
- Live Group Tracking page: map simulation, create/join group by code, member list with status
- Missing Person Reporting page: form with name, photo upload, last seen location, time, description, emergency contact
- Search & Alerts page: search by name/location, alert cards with map markers, filter by recent
- User Dashboard: profile management, tracking history, group management, alerts management
- Safety features: SOS button, share location, activity notifications
- Navigation with all pages
- Authorization (login/signup)
- Blob storage for photo uploads

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: user profiles, groups (create/join by code), group members with location+status, missing person reports, search/filter missing persons, SOS alerts
2. Frontend: React SPA with React Router, 6 pages, simulated map using CSS/SVG (no external map API), blue/green safety theme, mobile-first layout
3. Authorization component for login/signup
4. Blob-storage component for photo uploads in missing person reports
