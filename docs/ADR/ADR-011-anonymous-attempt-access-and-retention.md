# ADR-011: Anonymous attempt access and seven-day retention

**Status:** Approved policy; implementation pending human review
**Date:** 2026-10-10

## Decision

Assignment 002A uses anonymous per-attempt bearer access. Creation returns a
32-byte random base64url secret exactly once. PostgreSQL stores its SHA-256
digest only. Every implemented attempt read/write checks the secret and expiry;
no account system, ID-only access, recovery endpoint, or secret in a URL.
The future web client keeps the secret in session storage and explains session loss.

Missing/malformed Authorization returns 401. Unknown, wrong-secret, and expired
attempts return the same 404. Protected responses use no-store. Database records
are explicitly projected into shared response contracts; digests are never public.

Expiry is fixed at creation plus 168 hours. Activity never extends it. Services
use a database timestamp after obtaining the attempt row lock; expired access
is refused independently of physical cleanup. Cleanup deletes expired attempts
and cascades their evidence and validation history. A daily cron procedure is
documented, but no schedule is installed by this assignment.

Retain at most 100 validation runs per attempt and retain an aggregate lifetime
run count. Oversized expressions are rejected without persisting their contents;
normal bounded rejections are retained. No personal identifiers are collected.

## Consequences

Losing the bearer secret makes the attempt unrecoverable. This is a local demo
policy, not production account authentication. Creation volume is not globally
rate-limited; public deployment requires a separately reviewed operational policy.
WSL scheduling requires the distro and Docker to be running. Physical deletion
can lag expiry until cleanup runs; backups and production retention are outside scope.

## Authority

Approved vertical-slice specification, Assignment 002A, and human implementation
conditions dated 10 October 2026. Human review is required before acceptance.
