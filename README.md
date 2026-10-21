# NexusTech IT Expert Resource Hub

A production-grade, responsive full-stack platform for senior IT professionals, enterprise infrastructure architects, and system administrators to publish, explore, and download verified software solutions, technical architecture manuals, troubleshooting runbooks, and cybersecurity configurations.

---

## 1. Architecture & Design Specifications

- **Color Palette**:
  - Primary: Deep Navy Blue (`#101C32`)
  - Secondary: Professional Blue (`#2563EB`)
  - Accent: High-Tech Cyan (`#55D6FF`)
  - Backgrounds: Clean White and Slate Gray with seamless Dark Mode support
- **Technology Stack**:
  - React 19 + TypeScript (ES2022)
  - Tailwind CSS v4 with semantic dark mode variables
  - Firebase Authentication (Email/Password & Google Workspace Provider)
  - Cloud Firestore (Multi-tenant ABAC Data Model)
  - Firebase Storage (Protected & Public Technical Document Buckets)
  - Lucide Icons & Responsive Touch-First UI

---

## 2. Authentication & Verification Workflow

1. **Member Registration**:
   - Requires Full Name, Professional Email, minimum 8-character password, password confirmation, and terms agreement.
   - User account is provisioned via Firebase Auth.
   - Basic user document is saved to `/users/{uid}` with `role: "member"` and `status: "active"`.
   - Firebase dispatches an email verification link.
   - The user is signed out until verification is confirmed.
2. **Mandatory Email Verification Enforcement**:
   - The application checks `request.auth.token.email_verified == true`.
   - If an unverified user logs in, they are immediately signed out, member pages (`/dashboard`, `/profile`) remain locked, and they are redirected to a dedicated verification screen with a 60-second cooldown resend action.
3. **Password Recovery**:
   - Direct Firebase Authentication password reset workflow via `/forgot-password`.
4. **Session Handling & Logout**:
   - Secure token storage, real-time auth state synchronization, and clean session clearing.

---

## 3. Data Collections & Security Rules

All rules strictly adhere to Zero-Trust ABAC, default-deny safety nets, and identity integrity:

- `/users/{userId}`: Private user profile readable and updatable only by the owner or administrator. Members are strictly prevented from elevating their own `role` or altering `status`.
- `/users/{userId}/bookmarks/{bookmarkId}`: Private bookmark subcollection isolated to the matching authenticated owner with verified email.
- `/users/{userId}/downloads/{downloadId}`: Private download audit trail accessible only to the owner.
- `/admins/{userId}`: Trusted administrator registry document.
- `/resources/{resourceId}`: Technical resources catalog. Public resources are readable by all; members-only items require `request.auth.token.email_verified == true`. Writable exclusively by administrators. Verified users can only increment `downloadCount`.
- `/site_settings/general`: Publicly readable; editable only by administrators.
- `/audit_logs/{logId}`: Append-only immutable security audit records for administrative activities.
- `/contact_messages/{messageId}`: User contact inquiries with size limitations; viewable and manageable only by administrators.

---

## 4. Secure Administrator-Role Initialization

To initialize the primary administrator account:

1. The platform automatically trusts the system bootstrap administrator email: `sebleworksisay01@gmail.com`.
2. When this email account logs in and verifies its email address:
   - The system validates identity against the bootstrap credential.
   - It automatically provisions the registry record at `/admins/{uid}` in Firestore.
   - The user profile role is set to `"admin"`.
3. In the **Administrator Dashboard** (`/admin`), this primary administrator can grant or revoke administrator privileges to any other registered member with confirmation dialogs.
4. Security rules enforce that self-assigned roles during client registration are rejected.

---

## 5. Local Development Instructions

1. Clone or extract the project repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server on port 3000:
   ```bash
   npm run dev
   ```
5. Run the TypeScript build and lint check:
   ```bash
   npm run lint
   npm run build
   ```

---

## 6. Production Deployment Instructions

1. **Deploy Firestore Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```
3. **Build Frontend**:
   ```bash
   npm run build
   ```
4. **Deploy to Firebase Hosting / Cloud Run**:
   ```bash
   firebase deploy --only hosting
   ```

---

## 7. System Verification Checklist

- [x] **Registration Validation**: Form validates all required fields, email format, minimum length, password confirmation, and terms agreement.
- [x] **Default Role Integrity**: All registrations assign role `"member"` in `/users/{uid}`. Client cannot inject `"admin"`.
- [x] **Verification Link**: Email verification email is dispatched upon registration and signs user out.
- [x] **Unverified User Gating**: Users with unverified emails cannot access `/dashboard`, `/profile`, or protected downloads.
- [x] **Resend Cooldown**: Resend action enforces a 60-second cooldown timer.
- [x] **Password Reset**: Forgot-password dispatches Firebase reset email with error handling.
- [x] **Public Downloads**: Visitors can browse and download public documents without logging in.
- [x] **Protected Downloads**: Members-only downloads require verified email, log downloads to the user's private history, and increment download counts.
- [x] **Cross-User Isolation**: Members can only access their own private bookmarks and download history.
- [x] **Admin Governance**: Administrator dashboard allows creating, editing, and deleting resources, managing users, customizing branding, and viewing audit logs.
- [x] **Destructive Action Guards**: Confirmation dialogs require explicit confirmation before deleting resources or changing user roles/status.
