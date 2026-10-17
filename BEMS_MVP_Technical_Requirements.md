# BEMS — MVP Technical Requirements & Implementation Plan

**Project:** BRIGHT Education Management System (BEMS)  
**Document:** Technical specification for MVP planning  
**Version:** 0.1  
**Status:** Proposed — confirm business decisions before implementation  
**Context:** Kenya-first, with support for international curricula

---

## 1. Executive recommendation

Build BEMS first as a **responsive, installable Progressive Web App (PWA)** that supports one reliable end-to-end journey:

1. A learner registers and signs in.
2. The learner discovers an approved tutor or course.
3. The learner requests or books an available lesson.
4. The learner pays, if paid bookings are enabled.
5. The learner attends the lesson using an established video service.
6. The tutor records attendance and provides follow-up material or feedback.
7. The learner can review the booking and learning history.

The first release should be a **tutoring marketplace with essential learning features**, not a full school ERP and not a custom video-conferencing system.

### Recommended stack

| Layer | Recommendation | Why |
|---|---|---|
| Frontend | React + TypeScript, using Laravel's Inertia integration | Interactive, maintainable UI without needing a separately deployed frontend application |
| Backend | Laravel (current supported stable release) with PHP (current supported version) | Authentication, validation, authorization policies, queues, notifications, file storage and scheduled tasks in one mature framework |
| UI styling | Tailwind CSS | Responsive layouts and consistent design tokens |
| Database | PostgreSQL (managed service preferred) | Reliable relational data, transactions, constraints and reporting |
| Database access | Laravel Eloquent ORM + versioned migrations | Keeps data access and schema changes within the backend |
| PWA | Web app manifest + service worker; Vite PWA integration where compatible with the selected Laravel/Vite setup | Installability, app-shell caching and offline fallback |
| Authentication | Laravel authentication scaffolding; secure session-based authentication | Avoids custom password/session implementation |
| Authorization | Laravel policies/gates and server-side role/permission checks | Protects every restricted operation on the server |
| File storage | Private S3-compatible object storage, or a compatible managed storage service | Separates uploads from the application server and supports private files |
| Payments | Safaricom M-Pesa Daraja API through a server-side integration | Kenya-first payment workflow; provider onboarding and production access required |
| Online lessons | Integrate an existing meeting provider (e.g. Google Meet or Zoom, subject to client choice) | Avoids building and operating video infrastructure |
| Email | Transactional email provider selected by the client | Verification, booking messages and password recovery |
| SMS | Defer unless required for launch; choose a Kenyan-supported provider | Adds cost and operational complexity |
| Background jobs | Laravel queue worker; database queue for a small pilot or Redis when justified | Reliable reminders, email delivery and slow tasks |
| Scheduler | Laravel scheduler / cron | Booking reminders, expiry tasks and routine cleanup |
| Testing | Pest or PHPUnit for backend; Vitest and React Testing Library for frontend; Playwright for critical end-to-end flows | Unit, integration and browser-level confidence |
| Version control | Git + private GitHub repository | History, reviews, issue tracking and collaboration |
| CI/CD | GitHub Actions or hosting-provider deployment pipeline | Automated checks and repeatable deployment |
| Hosting | Managed Laravel-compatible hosting or a managed app platform, plus managed PostgreSQL | Reduces operational burden for a small team |
| Monitoring | Error tracking plus host/database health monitoring | Detects failures before users report them |

**Stack decision note:** This is a recommendation, not a decision already made by the client. Confirm hosting budget, developer experience, and provider requirements before committing. Pin exact dependency versions in lockfiles after creating the project; do not rely on unpinned global packages in production.

---

## 2. MVP boundary

### Must have for the first usable release

- Public homepage and curriculum/subject/course catalogue.
- Registration, sign-in, sign-out, password recovery and verified contact method.
- Roles for learner, tutor and administrator.
- Tutor application, document submission, admin review and approval.
- Public profiles for approved tutors only.
- Curriculum, education level, subject and course management.
- Tutor availability and booking with double-booking protection.
- Booking status, cancellation rules and lesson history.
- A selected, secure way to conduct the lesson.
- Student and tutor dashboards based on real database records.
- Payment integration **only if paid bookings are required at launch**; otherwise use an explicit “payment not enabled” state and do not simulate successful payments.
- Resource catalogue with administrator-only publishing.
- Basic parent/guardian linking if minors are in the launch audience.
- In-app notifications and essential email notifications.
- Support/contact workflow, privacy/terms pages, audit events and backups.
- PWA installation, responsive interface and a limited offline fallback.

### Defer until after the MVP

- Advanced virtual laboratories beyond the existing pH demonstration.
- Custom video conferencing or lesson recording infrastructure.
- Advanced analytics, recommendations and AI features.
- Full school ERP functions: admissions, timetables, fee management, report cards, payroll, procurement, transport and inventory.
- Complex offline transactions or offline booking.
- Multiple payment providers and international tax/payment workflows.
- Teacher self-publishing of official library resources. The scope says official resources are administered and published by authorized administrators.

### MVP acceptance rule

A feature is in the MVP only if it supports the core learner journey, is legally/operationally necessary for launch, or is explicitly approved by the client as a launch requirement.

---

## 3. Architecture

Use a **single application repository** initially. Keep responsibilities separated inside it rather than splitting into microservices.

```text
Browser / installed PWA
        |
        | HTTPS
        v
Laravel application
  ├── Web UI (React + Inertia)
  ├── Authentication and authorization
  ├── Booking and scheduling rules
  ├── Payment orchestration and callback endpoints
  ├── Resource and assignment workflows
  ├── Notifications and background jobs
  └── Admin operations and audit trail
        |
        +------ PostgreSQL database
        |
        +------ Private object storage
        |
        +------ M-Pesa Daraja API
        |
        +------ Selected video meeting provider
        |
        +------ Email / optional SMS provider
```

### Architectural rules

- The browser must never be trusted to determine permissions, payment status, commissions or booking availability.
- Keep payment credentials, database credentials and signing secrets on the server.
- Use database transactions and constraints for booking and payment state changes.
- Verify payment callbacks on the server and make callback processing idempotent.
- Keep private files in private storage; issue short-lived authorized download links when appropriate.
- Store provider IDs and references, not unnecessary sensitive provider payloads.
- Use a staging environment separate from production.
- Avoid microservices until there is a measured reason to split the system.

---

## 4. Languages and runtime

| Technology | Purpose |
|---|---|
| PHP | Backend application and business logic |
| TypeScript | Frontend code and type-safe UI interactions |
| SQL | Database queries, constraints and reporting |
| HTML | Accessible semantic page structure |
| CSS / Tailwind utility classes | Responsive presentation |
| JavaScript | Browser runtime; TypeScript is preferred for authored frontend code |
| JSON | API payloads, configuration and integration messages |
| Bash / YAML | Local developer scripts and CI workflows, as needed |

Use UTF-8 throughout. Store timestamps in UTC in the database and display them in the user's relevant time zone. For the Kenya-first launch, display East Africa Time by default while keeping the data model time-zone-aware.

---

## 5. Dependencies and tooling

Exact versions should be chosen from the current supported stable releases at project setup and committed in lockfiles. The table below names the dependency families and their role, rather than claiming a tested version matrix.

### Backend

- Laravel framework — application, routing, validation, ORM, policies, queues and notifications.
- PHP extensions required by the selected Laravel release and PostgreSQL driver.
- PostgreSQL PDO driver (`pdo_pgsql`).
- Composer — PHP dependency management.
- Laravel migrations and seeders — repeatable database schema and development data.
- Laravel queue worker — asynchronous notifications and background work.
- Laravel scheduler — reminders, expiry and maintenance tasks.
- Pest **or** PHPUnit — backend tests; choose one primary test runner.
- Optional permission package only if built-in policies/gates and a simple role model prove insufficient. Do not add a package before the permission model is understood.

### Frontend

- React — component-based interface.
- TypeScript — static type checking.
- Inertia.js React adapter — bridge between Laravel routes/controllers and React pages.
- Vite — frontend build tooling.
- Tailwind CSS — styling.
- A small accessible component library, selected after reviewing the prototype; avoid adding multiple overlapping UI libraries.
- Vitest — frontend unit tests.
- React Testing Library — component behaviour tests.
- Playwright — browser-based end-to-end tests for the core flows.

### PWA

- Web app manifest with name, icons, theme colour, display mode and start URL.
- Service worker, using a Vite-compatible PWA integration only after confirming compatibility with the chosen Laravel/Inertia build.
- Offline fallback page and an explicit caching policy.
- HTTPS in all deployed environments where PWA features are tested.

Do not cache private learner records, payment pages, authenticated API responses or sensitive documents by default. Clear or invalidate relevant cached content on sign-out and permission changes.

### Operations and developer tools

- Git and a private repository.
- Composer lockfile and JavaScript package lockfile.
- `.env.example` containing variable names only, never real secrets.
- Separate local, staging and production configuration.
- CI checks for formatting, static analysis, tests and production builds.
- Error monitoring and application/database health checks.
- Automated database backups plus a tested restoration procedure.

### Avoid unnecessary dependencies

Do not add Redis, Kubernetes, Elasticsearch, a separate API gateway, GraphQL, a custom video stack or a complex microservice architecture unless a verified requirement justifies the additional cost and maintenance.

---

## 6. Database requirements

### Recommended database

**PostgreSQL**, hosted as a managed database for production if the budget allows.

Why:
- Strong relational integrity for users, guardians, bookings and financial records.
- Transactions and constraints help prevent conflicting bookings and inconsistent payments.
- Flexible querying for dashboards and reports.
- Mature backup and recovery tooling.

### Initial logical data model

This is a starting model, not a final schema. Confirm cardinality, deletion rules, privacy requirements and business rules before migrations are finalized.

| Entity | Purpose / key fields |
|---|---|
| `users` | Identity, email/phone, verification state, account status |
| `roles` / `user_roles` | Role assignments; support multiple roles only if the client needs them |
| `learner_profiles` | Learner-specific profile data |
| `tutor_profiles` | Public tutor profile, bio, approved status, rates and preferences |
| `tutor_applications` | Application status, submitted data, review timestamps and decision history |
| `tutor_documents` | Private document metadata and storage keys; do not expose direct public paths |
| `guardian_links` | Learner–guardian relationship, invitation state, permissions and timestamps |
| `guardian_invitations` | Hashed single-use token, expiry, revocation and acceptance state |
| `consents` | Consent type, subject, version, actor, timestamp and withdrawal where applicable |
| `curricula` | CBE/CBC, Cambridge, IB, American, university and other configurable curricula |
| `education_levels` | Levels within a curriculum |
| `subjects` | Subject catalogue |
| `topics` | Topic structure where needed |
| `courses` | Course description, level, instructor, status and price rules |
| `course_enrolments` | Learner enrolment and status |
| `tutor_availability` | Availability windows, time zone and effective dates |
| `bookings` | Learner, tutor, start/end time, status, price snapshot and cancellation details |
| `lesson_sessions` | Meeting-provider reference, lesson status and session metadata |
| `attendance` | Participant attendance and recorded status |
| `resources` | Title, metadata, licence, access rule and publication state |
| `resource_files` | Private storage key, MIME type, size, checksum and version |
| `resource_reviews` | Review/approval decision and administrator |
| `assignments` | Course/learner, instructions, deadline and grading criteria |
| `submissions` | Learner submission metadata, file references and timestamp |
| `feedback` / `grades` | Tutor feedback, score where applicable and visibility rules |
| `payment_attempts` | Provider request reference, amount, currency and attempt status |
| `transactions` | Verified payment outcome and provider transaction reference |
| `commissions` | Platform fee calculation and rule/version applied |
| `refunds` | Refund request, provider reference, status and reconciliation |
| `payouts` | Tutor payout request, approval, reference and status |
| `notifications` | Notification content/reference, recipient, channel and delivery state |
| `support_tickets` | User issue, category, status and assigned handler |
| `audit_events` | Actor, action, target, timestamp and minimal relevant metadata |
| `platform_settings` | Controlled configuration such as policy versions and business rules |

### Database implementation rules

- Use primary keys, foreign keys, unique constraints and indexes deliberately.
- Add indexes for common lookups: booking tutor/time, learner/time, booking status, tutor approval, resource metadata and provider transaction reference.
- Use database transactions for booking creation, payment finalization, refunds and payout state changes.
- Prevent double booking with transaction-safe availability checks and appropriate database constraints/locking. A simple frontend availability check is insufficient.
- Use integer minor currency units where practical (for example, cents) or a rigorously defined decimal strategy; never use floating-point arithmetic for money.
- Store the currency explicitly (e.g. `KES`); do not assume every future transaction uses the same currency.
- Preserve financial and audit history. Avoid hard-deleting records that must be retained for reconciliation or legal reasons.
- Define data retention and deletion/anonymization rules before production.
- Keep private application documents, identity records and learner submissions out of public tables/URLs.
- Add development seed data that is clearly fictional. Never use real children's data in development or tests.

---

## 7. Authentication, roles and permissions

### MVP roles

1. **Visitor:** public catalogue and public pages only.
2. **Learner:** own profile, bookings, assignments, permitted resources and own records.
3. **Tutor:** own tutor profile, assigned learners, own bookings, approved teaching functions and earnings information.
4. **Parent/guardian:** only explicitly linked learners and only permitted information.
5. **Administrator:** operational management according to assigned permissions.

If one person may be both a tutor and a learner, design role assignment to support that intentionally rather than assuming one immutable role per account.

### Security requirements

- Store password hashes using the framework's secure password hashing implementation.
- Verify email and/or phone according to the agreed registration policy.
- Rate-limit sign-in, password recovery, invitation acceptance and other abuse-prone endpoints.
- Use secure session cookies, CSRF protection and HTTPS.
- Enforce authorization on every backend request; hiding buttons in React is not access control.
- Prevent insecure direct object references: users must not access another user's records by changing an ID in a URL.
- Require multi-factor authentication for administrators if feasible for the MVP.
- Log privileged changes and important decisions without recording passwords, tokens or unnecessary personal information.
- Protect against mass assignment, injection, XSS, CSRF, unsafe file uploads and broken access control.
- Store secrets in the host's secret manager or environment configuration, never in source control.
- Provide account suspension, recovery and session invalidation workflows.

### Parent/guardian linking

Follow the supplied scope's controlled invitation approach:
- A learner initiates the invitation flow from account settings, subject to the age and consent rules approved by the client.
- Use a cryptographically secure, single-use invitation token; store a hash of the token where practical.
- Enforce expiry, revocation, attempt limits and one-time acceptance.
- Do not link accounts based only on a name, email address or other guessable detail.
- Record who initiated and accepted the link, when it happened and what access was granted.
- Audit any administrator-assisted override.
- Decide explicitly whether one learner may have multiple guardians and whether one guardian may link multiple learners.

---

## 8. Booking and scheduling

Booking is a high-risk business workflow because errors can cause missed lessons and financial disputes.

### Minimum booking states

`requested → awaiting_payment → confirmed → completed`

Other allowed outcomes include `cancelled`, `refunded` and `disputed`. Define permitted transitions and who may trigger each one.

### Required rules

- Store start and end timestamps consistently; store the applicable time zone for display and scheduling.
- Prevent overlapping confirmed bookings for the same tutor.
- Re-check availability on the server during booking creation.
- Use a database transaction or locking strategy to handle simultaneous requests.
- Use an idempotency key or equivalent protection for repeated booking submissions.
- Make cancellation windows, rescheduling limits, refund eligibility and no-show handling configurable and documented.
- Generate meeting links securely and share them only with eligible participants.
- Record booking status changes and the actor responsible.
- Send confirmations only after the authoritative state has been saved.
- Add reminders through a queue/scheduler; failed notifications must not corrupt the booking.

---

## 9. M-Pesa and financial workflows

M-Pesa is a launch dependency **if paid bookings are included in the MVP**.

### Before implementation

The client must confirm:
- The business entity and payment account that will receive funds.
- The chosen Daraja product and payment flow.
- Provider onboarding, credentials, callback URL requirements and production approval.
- Whether payment is per lesson, per course, subscription-based or a combination.
- Platform commission rules and how the rules change over time.
- How and when tutor payouts happen.
- Refund, cancellation, failed-payment and dispute policies.
- Whether the platform is responsible for holding or distributing funds, and the provider's permitted settlement model.

### Minimum safe flow

1. The authenticated user requests payment from the backend.
2. The backend validates the booking, amount, currency and current status.
3. The backend creates a payment attempt with a unique internal reference.
4. The backend sends the request to the payment provider.
5. The system waits for a verified provider result/callback; a browser redirect or success message is not proof of payment.
6. The backend verifies authenticity and matches the callback to the expected request, amount and currency.
7. The transaction is updated idempotently; duplicate callbacks must not duplicate payments or bookings.
8. Booking confirmation and receipt generation follow the authoritative transaction state.
9. Failed or ambiguous transactions enter a retry/reconciliation workflow.
10. Refunds and payouts are separately recorded, authorized and reconciled.

Do not store M-Pesa PINs or payment credentials. Never put Daraja secrets in frontend code. Test with the provider sandbox and simulated duplicate, delayed and failed callbacks before production.

**MVP simplification:** if payout automation cannot be safely delivered in time, the client may approve a documented, audited manual payout workflow for the pilot. Do not claim automated payouts exist if they do not.

---

## 10. Video lessons, resources and assignments

### Video lessons

- Select one provider before building the lesson-join workflow.
- Store provider meeting IDs and access metadata securely.
- Create meeting links only for confirmed bookings.
- Restrict access to the learner and tutor associated with that booking.
- Define handling for cancellations, rescheduling and expired meetings.
- Defer recording unless the client has a clear need, consent process, retention schedule and access controls.

### Learning resource library

The source scope specifies that **only authorized administrators publish official library resources**. Preserve that rule in the MVP.

- Validate file type, size and metadata on the server.
- Scan uploads for malware where an appropriate service is available.
- Store files in private object storage, not an executable public directory.
- Record source, owner/licence, reviewer and publication state.
- Enforce access rules for public, registered, enrolled or paid content.
- Support replacement/unpublishing and maintain a useful audit trail.
- Use short-lived download links or a backend authorization endpoint for protected files.
- Cache only approved, authorized materials for offline use.

### Assignments

For the MVP, keep assignment workflows small:
- Tutor creates an assignment for an eligible learner/course.
- Learner submits a supported response or file before/after the deadline according to policy.
- Tutor records feedback and optional grade.
- The system enforces who can view the assignment, submission and feedback.

---

## 11. PWA and offline behaviour

### Must implement

- Valid manifest, app icons, app name, theme colour, display mode and start URL.
- HTTPS in staging/production.
- Responsive layouts and installability checks on agreed browsers/devices.
- App-shell/static asset caching.
- Offline fallback with a clear message that server-dependent features require connectivity.
- A documented cache refresh and invalidation strategy.
- Cache only selected public assets and approved learning resources.
- Remove sensitive cached state on sign-out and permission changes.

### Must not promise

- Offline payments, confirmed bookings, account changes or live classes.
- Guaranteed push notifications on every device/browser.
- Offline access to content that has been revoked or whose licensing forbids it.

For the MVP, **read-only access to selected previously cached resources** is enough. Offline booking queues introduce conflict resolution and duplicate-submission risks and should be deferred.

---

## 12. Privacy, safeguarding and compliance

The supplied scope identifies child safety and Kenya's data protection obligations as important launch considerations. Obtain qualified legal/privacy review; this technical document is not legal advice.

Before production:
- Map the personal data collected and the purpose for each field.
- Confirm the applicable legal basis, notices, consent requirements and guardian workflow.
- Establish access, correction, export and deletion/request-handling procedures as applicable.
- Set retention periods for accounts, tutor verification documents, lesson records, financial records, logs and uploaded work.
- Restrict access to children's information and private communications.
- Define teacher verification and safeguarding procedures.
- Define reporting, complaint escalation and incident response.
- Decide whether lesson recording is allowed; default to no recording until approved.
- Review data location, cross-border transfers and all third-party processors.
- Confirm whether registration with or other obligations to the relevant Kenyan data protection authority apply to the operating model.

Do not treat a guardian checkbox alone as a complete safeguarding or legal compliance system.

---

## 13. Testing and quality gates

### Automated tests

- Authentication and account recovery.
- Server-side role and record-level authorization.
- Tutor application approval/rejection and profile publication.
- Booking availability, overlapping requests, cancellation and rescheduling.
- Payment callback verification, duplicate callbacks, mismatched amount, failure and retry.
- Guardian invitation expiry, revocation, reuse prevention and access restrictions.
- Resource upload validation, private access and publishing workflow.
- Assignment submission and feedback visibility.
- PWA installability, offline fallback and cache invalidation.
- Notification failure and retry behaviour.

### Manual QA

- Desktop and mobile layouts.
- Keyboard navigation, visible focus, form labels and accessible errors.
- Slow or unstable internet.
- Common supported browsers and devices.
- Failed payment and interrupted booking flows.
- Administrator access and audit trail.
- Backup restoration and production recovery procedure.

### Release gates

Do not launch publicly until:
- Critical authorization tests pass.
- Payment handling is reconciled and tested if payments are enabled.
- Production secrets and HTTPS are configured correctly.
- Backups have been restored successfully in a test.
- Privacy notices, terms, cancellation/refund rules and support contacts are available.
- Monitoring and incident ownership are assigned.
- All sample/demo data and simulated success states are removed from production.

Aim for WCAG 2.2 AA accessibility, subject to testing and an agreed acceptance process.

---

## 14. Environments, deployment and operations

### Environments

- **Local:** developer machines with fictional seed data.
- **Staging:** production-like configuration, sandbox payment credentials and test accounts.
- **Production:** real users, live credentials, backups, monitoring and restricted staff access.

### Minimum deployment checklist

- Domain and HTTPS.
- Managed PostgreSQL with restricted network access and backups.
- Application hosting compatible with the selected Laravel release.
- Private object storage with least-privilege access.
- Environment secrets configured outside Git.
- Queue worker and scheduler running.
- Database migrations run through a controlled deployment process.
- Error tracking, logs and uptime/health monitoring.
- Backup retention and restoration runbook.
- Documented rollback procedure.
- Dependency/security update process.
- Staff access and offboarding process.

### Operational ownership

The client must assign a person/team to:
- Review tutor applications and verification documents.
- Approve and moderate learning resources.
- Respond to learner/guardian support requests.
- Handle complaints and safeguarding escalations.
- Reconcile payments and review payout records.
- Maintain policies, curriculum labels and course listings.
- Monitor outages, backups and security updates.

A production platform is an ongoing service, not just a code delivery.

---

## 15. Suggested implementation sequence

### Phase 0 — Discovery and decisions

- Confirm whether BEMS is primarily a tutoring marketplace, LMS, school management system or a combination.
- Approve the MVP feature list and explicitly defer non-MVP modules.
- Confirm pricing, commission, cancellation, refunds and payout rules.
- Select video, payment, email and hosting providers.
- Confirm age groups and guardian-consent workflow.
- Review the existing HTML prototype and decide which components can be reused.
- Produce wireframes, user journeys, data model, permission matrix and acceptance criteria.

**Deliverable:** approved MVP specification and architecture decisions.

### Phase 1 — Repository and foundation

- Create repository, Laravel project and React/TypeScript/Inertia setup.
- Configure PostgreSQL, migrations, environment variables and local setup documentation.
- Establish linting, formatting, automated tests and CI.
- Build responsive shared layout, navigation, error states and public pages.
- Add PWA manifest, icons and safe caching plan.

**Deliverable:** deployable skeleton with CI and staging environment.

### Phase 2 — Identity and administration

- Registration, login, logout, verification and password recovery.
- Roles, server-side policies and account status.
- Learner and tutor profiles.
- Tutor application and private document upload.
- Administrator review, approval and audit trail.
- Initial dashboards backed by database queries.

**Deliverable:** users and admins can complete secure account and tutor-approval workflows.

### Phase 3 — Learning catalogue and bookings

- Curriculum, level, subject and course administration.
- Approved tutor discovery and filtering.
- Availability management.
- Transaction-safe booking, cancellation and status history.
- Lesson provider integration and restricted meeting links.
- Booking reminders and lesson history.

**Deliverable:** a learner can find and book an approved tutor and attend a lesson.

### Phase 4 — Resources and learning records

- Admin-only resource publication and access controls.
- Basic assignments, submissions and feedback if confirmed as MVP.
- Progress and history views.
- Guardian linking if required for the initial audience.

**Deliverable:** the learning journey has basic follow-up and oversight.

### Phase 5 — Payments and launch readiness

- Implement M-Pesa if paid bookings are in scope.
- Test callback verification, retries, refunds and reconciliation.
- Add receipts and financial records.
- Complete security, privacy, accessibility and responsive QA.
- Test backups, monitoring, recovery and support procedures.
- Pilot with a small invited group before public release.

**Deliverable:** pilot-ready MVP with agreed acceptance criteria met.

### Phase 6 — Improvements based on evidence

Prioritize improvements using pilot feedback, support issues, usage data and actual business needs. Consider advanced labs, richer analytics, more payment methods and deeper school administration only after validation.

---

## 16. Client decisions required before coding

These are blockers or high-impact choices. Record the client's answers in the project decision log.

| Decision | Recommended default for MVP | Why it matters |
|---|---|---|
| Product identity | Tutoring marketplace with basic LMS features | Prevents uncontrolled expansion into a full school ERP |
| Paid bookings | Decide explicitly; if yes, include M-Pesa in MVP | Determines financial workflows and provider onboarding |
| Tutor payouts | Audited manual payouts for pilot if automated payout support is not ready | Reduces integration complexity without hiding the operational requirement |
| Video | Use one existing provider | Avoids custom video infrastructure |
| Registration | Email or phone verification; choose based on target users and delivery cost | Affects onboarding, recovery and notifications |
| Learner ages | Confirm launch age groups before guardian flows are finalized | Determines consent and safeguarding requirements |
| Guardian relationships | Secure invitation with expiry/revocation and explicit permissions | Prevents unauthorized access to learner records |
| Resources | Admin-only publication, with explicit licensing records | Matches the supplied scope and reduces copyright risk |
| Curriculum | Admin-managed catalogue | Avoids hard-coded curriculum assumptions |
| Offline support | App shell plus selected approved read-only resources | Useful without risking stale transactional data |
| Launch languages | Confirm before UI copy is finalized | Affects content, testing and accessibility |
| Hosting budget | Approve a monthly operating budget | Hosting, email, storage, video and payment costs recur |
| Support owner | Name the person responsible for operations | Applications, disputes, resources and payouts require human handling |

---

## 17. Key risks and mitigations

| Risk | Mitigation |
|---|---|
| Scope creep | Freeze MVP acceptance criteria; treat new modules as change requests |
| Double bookings | Server-side revalidation, transaction-safe writes and database constraints |
| False payment confirmation | Only verified server-side provider results can finalize payment |
| Duplicate payment callbacks | Idempotent callback processing and unique provider references |
| Unauthorized access to children's records | Record-level authorization tests, least privilege and audited guardian linking |
| Exposed identity documents or assignments | Private storage and short-lived authorized access |
| Copyright violations | Require ownership/licence metadata and administrator approval |
| Provider delays | Start onboarding and sandbox tests early; use a documented fallback plan |
| Unreliable offline assumptions | Limit offline support to approved read-only resources |
| Operational neglect | Assign owners for moderation, support, reconciliation and recovery |
| Poor cost predictability | Estimate recurring hosting, email/SMS, storage, video and payment costs before launch |

---

## 18. Definition of done for the MVP

The MVP is ready for a controlled pilot when:

- [ ] A visitor can view public pages and approved tutor/course listings.
- [ ] Users can register, authenticate and recover access securely.
- [ ] Tutors can apply and administrators can approve or reject applications.
- [ ] Only approved tutors and published content appear publicly.
- [ ] Learners can find a tutor and create a valid booking without double-booking.
- [ ] Eligible participants can access the correct lesson link.
- [ ] Payment status is accurate and auditable if paid bookings are enabled.
- [ ] Learners and tutors can see their own real records in dashboards.
- [ ] Resources are validated, access-controlled and published according to policy.
- [ ] Guardian access, if enabled, is restricted to explicitly linked learners.
- [ ] The PWA installs on agreed devices and has documented offline behaviour.
- [ ] Critical authorization, booking and payment tests pass.
- [ ] Privacy notices, terms, cancellation/refund rules and support paths are available.
- [ ] Monitoring, backups, restoration and incident ownership are in place.
- [ ] No demo metrics, fake payment confirmations or prototype-only actions remain in production.

---

## 19. Final recommendation

Start with **Laravel + React/TypeScript + Inertia + PostgreSQL**, a managed deployment, private object storage, one video provider, and M-Pesa only if paid bookings are part of launch.

Before writing feature code, hold a short discovery session and get explicit answers to the decisions in Section 16. Then implement the core journey in vertical slices—each slice should include UI, backend validation, database persistence, authorization and tests.

The most important technical work is not the homepage or the PWA install button. It is getting **permissions, bookings, payment state, guardian access and private learning records correct**. Build those foundations before adding advanced labs or analytics.

---

## Appendix A — Suggested repository structure

An initial single-repository layout could look like this; adapt to the selected Laravel/Inertia starter:

```text
bems/
├── app/
│   ├── Actions/              # Explicit business workflows, where useful
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/         # Server-side validation
│   ├── Models/
│   ├── Policies/             # Authorization rules
│   ├── Jobs/                 # Queued work
│   ├── Notifications/
│   └── Services/             # Payment/video provider adapters
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   ├── Layouts/
│   │   ├── Pages/
│   │   └── Types/
│   └── css/
├── routes/
├── tests/
├── public/
│   ├── icons/
│   └── manifest.json
├── .env.example
├── composer.json
├── package.json
└── README.md
```

Do not create every directory or abstraction on day one. Add structure as real features require it.

## Appendix B — Minimum project artefacts

Before the pilot, maintain these documents in the repository:

- `README.md` — setup, commands, architecture and troubleshooting.
- `docs/MVP_SCOPE.md` — approved in-scope/out-of-scope features.
- `docs/ARCHITECTURE.md` — components, integrations and key decisions.
- `docs/DATA_MODEL.md` — entities, relationships, retention and sensitive fields.
- `docs/PERMISSIONS.md` — role and record-level access matrix.
- `docs/PAYMENTS.md` — payment states, callback handling, reconciliation and refunds.
- `docs/DEPLOYMENT.md` — environments, deployment, rollback and secrets.
- `docs/INCIDENT_RESPONSE.md` — who responds and what to do.
- `.env.example` — variable names and safe placeholders only.
