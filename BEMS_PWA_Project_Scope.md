# BRIGHT Education Management System (BEMS)
## Progressive Web Application (PWA) — Project Scope

**Document type:** Project scope and functional requirements  
**Project:** BRIGHT Education Management System (BEMS)  
**Version:** 1.0  
**Status:** Proposed scope for planning and implementation  
**Primary context:** Kenya, with support for international curricula

---

## 1. Project Overview

BRIGHT Education Management System (BEMS) is planned as an installable, responsive Progressive Web Application (PWA) that brings learners, teachers/tutors, parents or guardians, and platform administrators together in one digital learning environment.

The existing BEMS HTML prototype provides the visual starting point and demonstrates the intended direction: curriculum discovery, teacher applications, a digital resource centre, a sample virtual chemistry lab, role-based dashboard previews, and planned payment and online-class integrations. These demonstrations are not yet a complete production system. The purpose of this project is to turn the prototype into a secure, functional, maintainable PWA backed by a server and database.

BEMS will support online tutoring, learning resources, lesson bookings, learner progress, educational administration, and payments. The system should be designed to work well on desktop and mobile browsers, be installable on supported devices, and provide carefully selected offline capabilities.

## 2. Project Objectives

The project aims to:

1. Provide a single platform for learners and families to find educational support.
2. Allow qualified teachers to apply, receive approval, manage their profiles, and deliver lessons.
3. Organize learning by curriculum, education level, subject, topic, and course.
4. Support lesson discovery, scheduling, booking, attendance, and lesson history.
5. Provide a managed library of authorized learning resources.
6. Give students and parents appropriate access to progress, assignments, and schedules.
7. Enable secure payment collection and transparent platform commissions and teacher payouts.
8. Give administrators tools to manage users, content, teachers, bookings, payments, and reports.
9. Provide PWA capabilities, including installation, responsive layouts, app-like navigation, and limited offline access.
10. Protect personal information and provide appropriate safeguards for children and other vulnerable users.

## 3. Target Users and Roles

### 3.1 Visitor
- Browse public information, supported curricula, subjects, and approved teacher/course listings.
- View public descriptions and registration information.
- Register or sign in.

### 3.2 Student / Learner
- Create and manage a learner profile.
- Browse teachers, courses, subjects, curricula, and resources.
- Book or request lessons and view booking status.
- Join scheduled online classes through the configured video service.
- View assignments, submit work where enabled, and review feedback and results.
- Track learning progress and lesson history.
- View payment records and receipts where applicable.
- Receive relevant announcements and reminders.
- Access previously cached, authorized learning materials offline where permitted.

### 3.3 Parent / Guardian
- A parent/guardian account cannot be created independently through public registration.
- A learner must first have an account. From the learner’s **Settings**, the learner can select **Create Parent Account** to initiate a controlled parent/guardian invitation flow.
- The system should generate a secure, single-use invitation or linking process. It must not allow a person to connect to a learner simply by entering the learner’s name, email, or other guessable details.
- The invited parent/guardian completes registration and verifies the required contact method. The system links the accounts only after the invitation is validated and accepted.
- The invitation must expire, be revocable, and be protected against reuse, guessing, and unauthorized disclosure.
- Provide a secure recovery and administrator-assisted process for cases where a learner cannot complete the flow or an invitation is lost. Any administrator override must be permission-controlled and audited.
- View linked learners’ schedules, progress, assignments, and payment records only according to explicit permissions.
- Provide and manage consent where required, with age-appropriate safeguards and legal review.
- Receive notifications relevant to linked learners.
- Manage approved payment activities without gaining unnecessary access to private learner communications.
- Define whether one learner can link multiple guardians and whether one guardian can be linked to multiple learners; enforce those rules consistently.

### 3.4 Teacher / Tutor
- Submit an application with identity/contact details, qualifications, experience, subjects, curricula, and supporting documents.
- Track application review status and respond to requests for additional information.
- Maintain a profile after approval.
- Set subjects, rates where applicable, availability, and lesson preferences.
- Manage bookings, schedules, lesson history, attendance, and cancellations.
- Conduct lessons using an integrated video-class service.
- Upload teaching materials and create assignments where permitted.
- Review learner submissions and provide feedback.
- View earnings, commissions, payout statements, and payout status.
- Receive operational notifications.

### 3.5 Administrator / Platform Owner
- Manage accounts, roles, access, suspensions, and support requests.
- Review and approve, reject, or request changes to teacher applications.
- Manage curricula, levels, subjects, courses, categories, and public listings.
- Review, approve, publish, unpublish, or remove resources.
- Manage bookings, disputes, cancellations, refunds, and complaints.
- Configure commissions, pricing rules, payment settings, and payout workflows.
- View operational, financial, engagement, and learning reports.
- Manage announcements, notifications, policy pages, and platform configuration.
- Review audit logs and security events.
- Configure staff permissions so that sensitive duties can be separated.

## 4. Curriculum and Learning Structure

The initial product should be able to organize content for:
- Kenyan CBE/CBC.
- Cambridge.
- International Baccalaureate (IB).
- American curriculum.
- College and university tutoring.
- Skills and professional learning.

The system should support a flexible hierarchy such as:

**Curriculum → Education level → Subject → Topic → Course/resource/lesson**

Curriculum names and levels should be managed by authorized administrators rather than hard-coded. Curriculum alignment, exam-board labels, and educational claims must be reviewed before publication.

## 5. Functional Scope

### 5.1 Public Website and Discovery
- Retain and improve the existing BEMS branding and responsive visual design.
- Provide homepage, programme/curriculum pages, teacher/course discovery, resource catalogue, FAQs, contact/support information, and policy pages.
- Provide search and filters for curriculum, level, subject, topic, teacher, availability, price, and resource type as appropriate.
- Include clear calls to register, sign in, book, or contact support.
- Ensure accessible navigation, readable content, and useful loading, empty, and error states.

### 5.2 Progressive Web App Capabilities
- Provide a valid web app manifest with application name, icons, theme colours, display mode, and start URL.
- Serve the application over HTTPS in production.
- Implement a service worker with an explicit caching strategy for the application shell and selected static assets.
- Offer installation on supported browsers/devices and a suitable install prompt or instructions.
- Support responsive layouts and app-like navigation on mobile and desktop.
- Provide an offline fallback and indicate when the user is offline.
- Cache only appropriate, authorized content; do not cache sensitive account data or private records by default.
- Define how cached content is refreshed, invalidated, and removed after sign-out or permission changes.
- Use push notifications only where supported, permissioned, and operationally justified.
- Treat offline use as limited: bookings, payments, account changes, live lessons, and other server-dependent actions require connectivity. Queueing offline actions, if later added, must handle conflicts and duplicate submissions safely.

### 5.3 Authentication and Account Management
- Registration and sign-in for supported roles.
- Secure password storage handled by the authentication provider/server; never store plain-text passwords.
- Email or phone verification as selected during technical design.
- Password reset, session management, sign-out, and account recovery.
- Role-based authorization enforced on the server, not only by hiding front-end controls.
- Profile editing and account status management.
- Optional multi-factor authentication for administrators and other high-privilege users.
- Rate limiting, abuse protection, and secure handling of authentication errors.

### 5.4 Teacher Application and Verification
- Application form and secure supporting-document upload.
- Application status: draft, submitted, under review, additional information requested, approved, rejected, or suspended.
- Administrator review with internal notes and an auditable decision history.
- Publication of approved profiles only.
- Periodic review or re-verification where the operating model requires it.
- Clear retention and access rules for identity and qualification documents.

### 5.5 Teacher, Course, and Lesson Discovery
- Search and browse approved teachers, courses, subjects, and programmes.
- Filter and sort results using relevant criteria.
- Teacher profiles with approved qualifications, experience, subjects, curriculum, lesson format, availability, and rates where applicable.
- Course pages with descriptions, learning outcomes, level, curriculum, instructor, schedule, price, and prerequisites where relevant.
- Prevent unpublished or suspended profiles and courses from being booked.

### 5.6 Scheduling and Booking
- Teacher availability calendar and time-zone-aware scheduling.
- Booking requests or instant booking according to platform rules.
- Booking states such as requested, awaiting payment, confirmed, completed, cancelled, refunded, and disputed.
- Prevent conflicting bookings and double-booking.
- Booking confirmation, rescheduling, cancellation, and reminder workflows.
- Configurable cancellation and refund policies.
- Attendance recording and lesson history.
- Secure creation and distribution of meeting links; access should be restricted to eligible participants.
- Audit trail for significant booking changes.

### 5.7 Online Lessons
- Integrate a selected video meeting provider or classroom SDK.
- Allow eligible participants to join scheduled sessions.
- Display class details, materials, and relevant instructions.
- Support attendance and post-lesson status.
- Define whether recording is allowed; if enabled, obtain required consent and implement access and retention controls.
- Do not build a custom video infrastructure unless justified by cost, scale, and technical capacity.

### 5.8 Learning Resource Library
- **Only authorized administrators can upload, edit, publish, unpublish, replace, or remove official learning resources.** This includes notes, curriculum designs, revision papers, books/eBooks, worksheets, videos, and other learning content.
- Teachers can access authorized resources and use or assign them for teaching, but cannot upload or publish official library content. If required, teachers may submit resource suggestions to an administrator for review.
- Resource metadata: title, description, curriculum, level, subject, topic, format, language, uploader, licence/permission status, publication status, and date.
- Search and filter by metadata.
- Secure administrator upload, file-type and size validation, malware scanning where available, and storage outside public execution paths.
- Administrator review and approval before public publication.
- Access controls for public, registered, enrolled, or paid content.
- Download/view permissions and basic usage reporting.
- Respect copyright and licensing; only publish material the platform is authorized to distribute.
- Keep a record of resource ownership, source, licence, and publishing administrator where applicable.

### 5.9 Assignments and Learning Progress
- Teachers can create assignments for a course or learner.
- Set instructions, deadlines, permitted submission formats, and grading criteria.
- Learners can submit work and view status.
- Teachers can grade work and provide feedback.
- Record completed lessons, course progress, assessment results, and learning activity where appropriate.
- Present progress information clearly without implying that automated metrics alone determine learner ability.
- Ensure parent access is limited to linked learners and permitted information.

### 5.10 Virtual Laboratories
- Retain the current pH selector as a demonstration, then expand the lab experience only after learning requirements are defined.
- Support selected interactive simulations for chemistry, physics, biology, or mathematics.
- Provide learning objectives, instructions, safety notes, observations, and knowledge checks.
- Use licensed or approved simulations and clearly label approximations.
- Avoid representing simplified simulations as real laboratory measurements.
- Treat advanced simulations as a separate feature package if they require third-party licences or specialist development.

### 5.11 Payments, Commissions, and Payouts
- Integrate M-Pesa through an approved provider/API and, if required, additional payment methods.
- Create server-side payment requests and verify provider callbacks before marking transactions as paid.
- Maintain transaction references, amount, currency, status, timestamps, and associated booking/order.
- Support payment status handling, failed payments, retries, duplicate callback protection, refunds, and reconciliation.
- Calculate platform commission and teacher net earnings using documented, configurable rules.
- Track payout requests, approvals, references, failures, and completion.
- Provide receipts and transaction history.
- Restrict access to financial information and maintain audit records.
- Do not store payment credentials or treat a browser success message as proof of payment.
- Complete provider onboarding and test in a sandbox before production.

### 5.12 Notifications and Communication
- In-app notifications for account events, applications, bookings, assignments, payments, and announcements.
- Email and/or SMS notifications through selected providers.
- Push notifications as an optional PWA capability where supported and consented to.
- User notification preferences and appropriate unsubscribe/opt-out handling.
- Avoid exposing sensitive learner information in lock-screen notifications.
- Record delivery status where supported and provide fallback information for failed delivery.

### 5.13 Dashboards and Reporting
Each role should have a real dashboard backed by live data.

**Administrator**
- User and teacher counts, application queue, bookings, resources awaiting review, transaction summaries, disputes, and system alerts.

**Student**
- Upcoming lessons, enrolled courses, assignments, progress, resource access, and payment history.

**Teacher**
- Upcoming lessons, availability, learner lists, assignments, earnings, commissions, and payout status.

**Parent/Guardian**
- Linked learners, upcoming lessons, progress summaries, outstanding actions, and authorized payment records.

Reports should be permission-controlled, date-filterable where useful, and based on traceable source records. The current prototype figures must be replaced with actual database queries.

### 5.14 Support and Content Administration
- Contact/support request workflow.
- FAQs and announcements.
- Report-content and report-user mechanisms.
- Complaint, dispute, and incident handling.
- Terms of use, privacy notice, acceptable-use rules, cancellation/refund policy, and content policy.
- Admin audit trail for significant changes and decisions.

## 6. Non-Functional Requirements

### 6.1 Security
- Enforce authorization on the server for every protected operation.
- Use HTTPS and secure session/cookie practices.
- Validate and sanitize all inputs; use parameterized database operations.
- Apply rate limits, upload restrictions, anti-abuse controls, and secure secrets management.
- Protect against common web risks, including cross-site scripting, cross-site request forgery where relevant, injection, broken access control, and insecure direct object references.
- Encrypt data in transit and use appropriate encryption and access controls for sensitive stored data.
- Maintain backups, audit logs, dependency updates, incident response procedures, and restoration tests.
- Do not expose private keys, API secrets, or privileged credentials in front-end code.

### 6.2 Privacy and Child Safety
- Design for Kenya's applicable data protection and child-protection requirements, including review of the Data Protection Act and relevant guidance.
- Define lawful purposes, data minimization, retention periods, access rights, deletion processes, and handling of data-subject requests.
- Use age-appropriate notices and parental/guardian consent workflows where required.
- Restrict access to children's personal details, communications, meeting links, and records.
- Establish teacher verification, reporting, moderation, and escalation procedures.
- Obtain appropriate consent and controls for any lesson recordings or sensitive educational data.
- Seek qualified legal/privacy advice before launch; this document is not legal advice.

### 6.3 Performance and Reliability
- Optimize images, scripts, styles, and network requests.
- Load large lists and resources efficiently.
- Provide visible loading, empty, success, and error states.
- Monitor application errors and service availability.
- Set and test service-level targets before production launch.
- Ensure critical operations such as payments and booking confirmation are resilient to retries and duplicate requests.

### 6.4 Accessibility and Usability
- Use semantic HTML, keyboard-accessible controls, visible focus indicators, form labels, and clear error messages.
- Aim for WCAG 2.2 AA accessibility, subject to testing.
- Support mobile, tablet, and desktop screen sizes.
- Use clear language and consistent navigation.
- Design for varying connection quality and avoid unnecessary large downloads.

### 6.5 Maintainability
- Separate front-end, backend, database, and integration responsibilities.
- Use version control, environment-based configuration, code review, automated tests, and deployment documentation.
- Document data models, APIs, permissions, operational procedures, and recovery steps.
- Provide staging and production environments.

## 7. Suggested Technical Architecture

The exact stack should be confirmed before implementation. A suitable architecture may include:

- **PWA frontend:** A maintainable component-based framework or structured frontend, with a manifest, service worker, responsive UI, and accessible components.
- **Backend/API:** Server-side application exposing authenticated APIs and enforcing business rules.
- **Database:** Relational database for users, roles, curricula, courses, bookings, assignments, transactions, and audit records.
- **File storage:** Private object storage for documents, learning resources, and permitted submissions.
- **Authentication:** A trusted authentication service or securely implemented server-side authentication.
- **Payments:** M-Pesa Daraja or another approved provider, with server-side callback verification and reconciliation.
- **Video lessons:** A selected video provider or meeting SDK.
- **Notifications:** Email/SMS provider and optional web push.
- **Hosting and operations:** HTTPS, domain, environment secrets, monitoring, backups, logging, and automated deployment.

Selection criteria should include total cost, support, developer familiarity, data location and transfer considerations, security, scalability, vendor lock-in, and integration availability. No particular provider is assumed to have been selected.

## 8. Core Data Entities

The database design is expected to include entities similar to:

- Users, roles, permissions, profiles, and account status.
- Parent/guardian–learner relationships and consent records.
- Teacher applications, qualifications, verification decisions, and documents.
- Curricula, education levels, subjects, topics, courses, and course enrolments.
- Teacher availability, bookings, lesson sessions, attendance, and meeting references.
- Resources, licences, upload records, moderation decisions, and access rules.
- Assignments, submissions, grades, feedback, and progress records.
- Payment requests, transactions, commissions, refunds, payout requests, and reconciliation records.
- Notifications, support tickets, complaints, audit events, and platform settings.

This is a conceptual list, not a finalized database schema. Relationships, retention rules, and access permissions must be designed before implementation.

## 9. Delivery Phases

### Phase 1 — Discovery and design
- Confirm business rules, user journeys, pricing, commissions, refund policies, and MVP requirements.
- Choose the stack and providers.
- Design database entities, API boundaries, permission model, wireframes, and acceptance criteria.

### Phase 2 — PWA foundation
- Refactor the prototype into maintainable components.
- Build responsive layouts, manifest, icons, service worker, offline fallback, and installation behaviour.
- Set up environments, version control, deployment pipeline, and error monitoring.

### Phase 3 — Accounts and administration
- Implement authentication, profiles, roles, permissions, teacher applications, and admin review.
- Connect dashboards to real data.

### Phase 4 — Learning marketplace
- Build curriculum and course management, teacher discovery, scheduling, booking, and lesson history.
- Add assignments, progress tracking, and resource moderation.

### Phase 5 — Integrations
- Integrate video lessons, M-Pesa, notifications, and secure file storage.
- Implement transaction reconciliation and payout workflows.

### Phase 6 — Quality, privacy, and launch
- Test functional flows, security, accessibility, PWA installation, offline behaviour, and mobile responsiveness.
- Verify backup restoration, monitoring, policies, and support processes.
- Pilot with a controlled group before public launch.

### Phase 7 — Enhancements
- Expand virtual labs, analytics, institutional tools, additional payment methods, advanced assessments, and other features based on user feedback and validated demand.

## 10. MVP Scope and Release Priorities

The first usable release should focus on the smallest set of features needed to deliver a safe, end-to-end learning service.

**Recommended MVP**
1. Public website and installable PWA foundation.
2. Secure sign-up, sign-in, and role-based access.
3. Teacher application, review, and approved teacher profiles.
4. Curriculum, subject, course, and resource catalogue.
5. Teacher availability and lesson booking.
6. A reliable lesson-delivery method.
7. Payment collection and transaction records if paid bookings are part of launch.
8. Student and teacher dashboards backed by real data.
9. Basic parent/guardian linking and safeguards where learners are minors.
10. Notifications, support, privacy controls, backups, and administrative audit logs.

**Potentially later**
- Advanced virtual laboratories.
- Sophisticated learning analytics and recommendations.
- Custom video infrastructure.
- Complex school-wide student information system functions such as full admissions, timetabling, report cards, and fee management, unless confirmed as core business requirements.
- Advanced offline workflows beyond reading selected cached resources.

## 11. Out of Scope Unless Separately Approved

Unless the project owner adds these to the requirements, the following are not assumed to be part of the initial release:

- A full school ERP covering payroll, procurement, accounting, transport, and inventory.
- Building a custom video-conferencing platform.
- Creating every learning resource from scratch.
- Digitizing or distributing copyrighted materials without permission.
- Guaranteed operation of payment or live-class features without internet connectivity.
- Automated educational decisions that replace teacher or administrator judgement.
- Native Android/iOS applications separate from the PWA.
- International payment, tax, or legal workflows not explicitly scoped.

## 12. Acceptance Criteria

The project should not be considered production-ready until agreed tests demonstrate that:

1. Users can register, authenticate, recover access, and only access permitted functions.
2. Teacher applications can be submitted, reviewed, and published only after approval.
3. Approved teachers, courses, resources, and schedules can be managed from the backend.
4. Learners can find a teacher, create a booking, and see its authoritative status.
5. Eligible users can join the correct scheduled lesson securely.
6. Payments are verified server-side and recorded accurately, including failed, duplicate, and refunded cases.
7. Teachers can manage lesson records and see accurate earnings and payout statuses.
8. Learners and authorized guardians can access the correct progress and assignment records.
9. Resource uploads are validated, access-controlled, and moderated according to policy.
10. The PWA can be installed on supported devices and its offline behaviour matches documented expectations.
11. Sensitive data is protected, permissions are tested, and backup restoration has been demonstrated.
12. The site works across agreed browsers and screen sizes and passes agreed accessibility and security checks.
13. Monitoring, error reporting, support, privacy notices, and operational procedures are ready.
14. No sample figures or demo-only success messages are presented as real production records.

## 13. Key Risks and Dependencies

- **Payments:** Provider approval, API access, callbacks, settlement rules, and refunds must be confirmed.
- **Video:** Provider costs, browser/device support, meeting security, and usage limits need evaluation.
- **Content rights:** Resource licensing and moderation are essential to avoid unauthorized distribution.
- **Child safety and privacy:** Consent, data minimization, safeguarding, and incident handling require explicit policies and implementation.
- **Internet reliability:** Offline support is limited for live and transactional features.
- **Scope growth:** Adding full school administration, advanced labs, or complex analytics may materially increase cost and delivery time.
- **Operations:** The project needs a person/team responsible for support, content moderation, teacher review, payment reconciliation, backups, and security updates.
- **Costs and timeline:** These cannot be estimated reliably until the MVP, provider choices, design, and implementation resources are agreed.

## 14. Decisions Required from the Project Owner

Before development is finalized, confirm:

1. Is BEMS primarily a tutoring marketplace, a school management system, a learning platform, or a combination?
2. Which user groups and features must be available in the first release?
3. Will learners pay per lesson, through subscriptions, by course purchase, or through a combination?
4. What commission will BEMS retain, and how will teachers receive payouts?
5. Which M-Pesa and video-class providers will be used?
6. Will registration use email, phone number, or both?
7. What age groups will use the platform, and what guardian-consent process is required? The proposed flow starts in learner Settings using **Create Parent Account**; confirm any age-based exceptions and administrator-assisted recovery rules.
8. Will resources be free, paid, restricted to enrolled learners, or a combination?
9. Which languages are required at launch?
10. What are the launch budget, target date, expected usage, and ongoing support capacity?
11. Is a full school-management module required, including admissions, attendance, fees, timetables, and report cards?
12. Who will own content review, teacher verification, customer support, and payment reconciliation?

## 15. Definition of Project Success

BEMS will be successful when it can safely and reliably support a complete learning journey: a learner or guardian registers, finds an approved teacher or course, books a lesson, completes payment where applicable, attends the lesson, accesses permitted materials, receives feedback, and can review learning progress—while the teacher and administrator can manage their respective responsibilities using accurate, secure records.

The PWA should be installable, responsive, maintainable, and dependable under the agreed operating conditions. Its real capabilities must be clearly distinguished from any demonstration or planned feature.

---

**End of project scope.**
