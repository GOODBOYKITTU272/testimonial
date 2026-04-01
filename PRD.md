# Product Requirements Document (PRD)
**Product Name:** ApplyWizz Client Journey Platform
**Document Version:** 1.0
**Target Release:** v1.0 (MVP)

---

## 1. Executive Summary

ApplyWizz is a recruitment concierge and application service that acts on behalf of candidates to secure interview opportunities. The **Client Journey Platform** is designed to solve a core business challenge: demonstrating tangible ROI and setting realistic timeline expectations (the "Journey") for clients.

By surfacing verifiable data (application dates, timestamps, communication logs, and official interview invitations), the platform builds trust, showcases the actual timeline of hiring at top-tier companies, and encourages clients to maintain their subscriptions through the natural corporate hiring delays.

## 2. Product Vision & Goals

**Vision:** To provide unparalleled transparency into the job application process, proving the value of persistent, high-quality applications.
**Goal 1:** Increase client retention by setting realistic timeline expectations (e.g., demonstrating that a 40+ day timeline for a quality enterprise interview is normal).
**Goal 2:** Create a marketing asset. Successful journeys act as verifiable case studies that can be shared via unique URLs.
**Goal 3:** Standardize the collection of success metrics and proof points (screenshots) from ApplyWizz consultants.

## 3. Target Audience

1. **Active ApplyWizz Clients (B2C):** Candidates currently using the service who need reassurance that the process is working, even during "silent" periods from employers.
2. **Prospective Clients (B2C):** Leads reviewing case studies to understand the typical timeline and success rate of the ApplyWizz service.
3. **Internal Operations (B2B/Admin):** ApplyWizz consultants and administrators who input journey data, track success metrics, and monitor consultant performance.

## 4. Key Features & Requirements

### 4.1 Internal Admin Portal (Data Entry)
**Description:** A secure interface where ApplyWizz consultants log successful candidate journeys.
- **Form Inputs:**
  - **Role Classification:** Job Role (Dropdown), Current Status (Assessment/Interview), Consultant Name.
  - **Client Details:** Client Email, Client Name, Target Salary Range.
  - **Company Details:** Company Name, Short Code (for URL generation), Company Description.
  - **Key Dates:** Start Date, Application Date, Thanks Email Date, Interview Date, Journey Duration (calculated or manual).
- **Proof Uploads:** Ability to upload exactly three (3) critical proof screenshots:
  1. Internal Application Confirmation
  2. Employer Acknowledgment (Thank You Email)
  3. Official Interview Invitation
- **Pasting Capabilities:** Support for Ctrl+V direct pasting into image slots for high-speed consultant data entry.
- **Validation:** Duplicate detection based on Client Email + Company Name to prevent redundant records.

### 4.2 Public Client Journey Page (Case Study View)
**Description:** A dynamically generated, highly polished landing page accessible via a short URL (e.g., `applywizz.com/journey/jp-morgan`).
- **Dynamic Routing:** Next.js dynamic routes mapping to the Supabase database via the `company_short_code`.
- **Hero Section:** High-impact branding highlighting the days taken to secure the interview.
- **Alternating Timeline Layout:** 
  - A vertical visual timeline.
  - Alternating layout (Left/Right) between the descriptive text card detailing what ApplyWizz did, and the verified proof screenshot.
- **Corporate Reality Grid:** A data table educating the user on industry-standard hiring timelines (Enterprise vs. Mid-size vs. Startups) to ground their expectations.
- **Responsive Design:** Complex desktop layouts (3-column alternating grids) must gracefully collapse to mobile-friendly vertical stacks.

### 4.3 Database Architecture
**Description:** Relational database hosted on Supabase (PostgreSQL).
- **Table:** `testimonials`
- **Storage:** Supabase Storage bucket (`images`) for hosting the uploaded proof screenshots.
- **Security:** Public read access for the Journey pages, authenticated/RLS-protected write access for the Admin portal.

## 5. Technical Stack

- **Frontend:** React, Next.js (App Router), Tailwind CSS v4.
- **Backend/Platform:** Next.js Server Components.
- **Database / BaaS:** Supabase (Postgres Database, Storage, Auth).
- **Icons & UI:** Lucide React, Custom SVG layouts.
- **Date Handling:** `date-fns` for accurate formatting and ISO parsing.

## 6. UX / UI Guidelines

- **Brand Colors:** 
  - Jet Black (`#111111`) for authority and contrast.
  - Fluorescent Green (`#00FF00` or equivalent hex) for success metrics and highlights.
  - Bright Blue (`#0000FF` or equivalent hex) for primary actions and trust markers.
- **Typography:** Modern, aggressive sans-serif stack (e.g., Inter) prioritizing legibility and a premium tech aesthetic.
- **Proof Presentation:** All uploaded screenshots must conform to a standardized bounding box (e.g., `h-56`, `object-cover object-top`, rounded borders with uniform shadows) regardless of original aspect ratio to maintain professional uniformity.

## 7. Future Considerations (v2.0)

- **Auth Layer:** Implement NextAuth or Supabase Auth to strictly lock down the Admin portal.
- **Analytics Dashboard:** A high-level overview for administrators to see average journey times across different roles and the success rates of specific consultants.
- **Automated Timeline Calculation:** Auto-calculate the `journey_duration_days` based on the delta between `application_date` and `interview_date`.
- **Client Portal:** A secure login area for active candidates to view their own localized pipeline in real-time, pulling directly from the Journey database.

## 8. Success Metrics

- **Admin Adoption:** 100% of consultants using the portal to log successful interviews.
- **Client Retention:** Observe a measurable drop in client churn within the 30-45 day "waiting window" after sharing Journey links.
- **Lead Conversion:** Track page views and subsequent sign-ups originating from shared Journey URLs.
