# Security Specification & Adversarial Test Matrix

## 1. Data Invariants
1. **Default Deny:** All paths reject unauthenticated or unpermitted operations.
2. **User Profile Isolation:** A user profile in `/users/{userId}` can only be read and updated by the authenticated owner (`request.auth.uid == userId`) or an admin.
3. **Privilege Escalation Prevention:** Normal members cannot modify their own `role` or `status`. Registration can only assign `role: "member"` and `status: "active"`.
4. **Admin Trust Root:** Administrator authorization requires existence of `/databases/$(database)/documents/admins/$(request.auth.uid)` or verified match with system bootstrap admin email (`sebleworksisay01@gmail.com` with `email_verified == true`).
5. **Verified Email Mandate:** Writing bookmarks, downloads, and accessing member-only content requires `request.auth.token.email_verified == true`.
6. **Resource Integrity:** Only administrators may create, modify, archive, or delete resources. Public users and verified members may only read published resources. Incrementing download counter is controlled.
7. **Subcollection Master Gate:** Bookmarks and downloads under `/users/{userId}/...` require `request.auth.uid == userId` and verified email.
8. **Contact Messages:** Public or authenticated visitors may create contact inquiries with size limits; only administrators may list, read all, update status, or delete inquiries.
9. **Audit Logs:** Only administrators can view or write audit logs; modifications and deletions are forbidden.
10. **Site Settings:** Publicly readable; writable only by administrators.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Privilege Escalation on Register:** User tries to create `/users/{uid}` with `role: "admin"`. -> REJECT.
2. **Role Tampering on Profile Update:** Member tries to update `role` from `"member"` to `"admin"`. -> REJECT.
3. **Ghost Field Injection:** Member attempts to update profile with `{ role: "member", isSuperUser: true }`. -> REJECT.
4. **Cross-User Snooping:** Authenticated User A attempts `get` or `list` on `/users/{UserB}/bookmarks`. -> REJECT.
5. **Unverified Member Bypass:** User with `email_verified == false` attempts to record or fetch protected downloads. -> REJECT.
6. **Malicious Resource Publish:** Non-admin attempts `create` on `/resources/exploit` with backdoored file. -> REJECT.
7. **Unpublished Resource Snooping:** Unauthenticated visitor or member attempts to read draft or archived resource. -> REJECT.
8. **Audit Log Tampering:** Compromised member or external caller tries to delete or alter `/audit_logs/{logId}`. -> REJECT.
9. **Massive Payload Injection (Denial of Wallet):** Attacker sends 2MB string in contact message. -> REJECT.
10. **Path Traversal / ID Poisoning:** Malicious docId with symbols `../../../etc/passwd` or 1KB characters. -> REJECT.
11. **Admin Registry Direct Write:** Attacker tries to write to `/admins/{theirUid}` without being an authorized admin. -> REJECT.
12. **Site Settings Defacement:** Non-admin attempts to overwrite `/site_settings/general` branding. -> REJECT.
