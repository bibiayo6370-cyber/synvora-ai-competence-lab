# SYNVORA Developer Command Reference

> **Status:** Live project document
> **Purpose:** Personal command reference for the SYNVORA AI Engineering Competence Lab.
> **Maintenance:** Update this document whenever an important development, Git, Docker, pnpm, PostgreSQL, testing, WSL, or Codex command is introduced during the project.

---

## 1. Environment & WSL

| Command | Description |
|---|---|
| `wsl -l -v` | Lists installed WSL distributions, their status, and WSL version. |
| `wsl --install -d Ubuntu` | Installs the Ubuntu WSL distribution. |
| `wsl --shutdown` | Shuts down all WSL instances so configuration changes can take effect. |
| `uname -a` | Displays Linux kernel, architecture, and system information. |
| `mount \| grep '/mnt/c'` | Inspects how the Windows `C:` drive is mounted in WSL. |

## 2. Navigation & Filesystem

| Command | Description |
|---|---|
| `pwd` | Displays the current working directory. |
| `ls` | Lists files and directories in the current directory. |
| `ls -la` | Lists files, including hidden files, with detailed information. |
| `ls -ld <path>` | Displays detailed information about a directory or symbolic link. |
| `ls /mnt/c` | Lists the contents of the Windows `C:` drive from Ubuntu. |
| `mkdir <directory>` | Creates a directory. |
| `mkdir -p <path>` | Creates a directory and any required parent directories. |
| `cd <path>` | Changes to a directory. |
| `ln -s <target> <link>` | Creates a symbolic link. |
| `touch <file>` | Creates an empty file or updates a file timestamp. |
| `rm <file>` | Removes a file. |

### SYNVORA filesystem shortcut

The Windows project directory:

```text
C:\Users\jtd\Documents\Projects
```

is accessed from Ubuntu through:

```text
~/projects
```

The symbolic link was created with:

```bash
ln -s /mnt/c/Users/jtd/Documents/Projects ~/projects
```

Therefore:

```bash
cd ~/projects
```

is the preferred shortcut for entering the Windows Projects directory.

## 3. Node.js, npm & pnpm

| Command | Description |
|---|---|
| `node -v` | Displays the installed Node.js version. |
| `npm -v` | Displays the installed npm version. |
| `pnpm -v` | Displays the installed pnpm version. |

### Current environment

- Node.js: `v24.21.0`
- npm: `11.0.0`
- pnpm: `12.10.1` (project-selected)

## 4. Git

| Command | Description |
|---|---|
| `git --version` | Displays the installed Git version. |
| `git init` | Initializes a new Git repository. |
| `git status` | Shows the current Git repository state. |
| `git branch --show-current` | Displays the current branch. |
| `git branch -m main` | Renames the current branch to `main`. |
| `git config --global init.defaultBranch main` | Makes `main` the default branch for future Git repositories. |
| `git config --global --get user.name` | Displays the configured global Git username. |
| `git config --global --get user.email` | Displays the configured global Git email. |
| `git config --global user.name "Your Name"` | Sets the global Git username. |
| `git config --global user.email "your-email@example.com"` | Sets the global Git email. |
| `git add .` | Stages changes for the next commit. |
| `git commit -m "message"` | Creates a commit with a message. |
| `git pull` | Retrieves and integrates changes from the remote repository. |
| `git push` | Pushes local commits to the configured remote repository. |

## 5. GitHub & SSH

| Command | Description |
|---|---|
| `gh --version` | Checks whether GitHub CLI is installed. |
| `ls -la ~/.ssh` | Lists SSH configuration files and keys. |
| `ssh-keygen` | Generates an SSH public/private key pair. |
| `cat ~/.ssh/id_ed25519.pub` | Displays the Ed25519 public key for adding to GitHub. |
| `ssh -T git@github.com` | Tests SSH authentication with GitHub. |
| `git remote add origin <ssh-url>` | Connects the local repository to a GitHub remote. |
| `git remote -v` | Displays configured Git remote URLs. |
| `git ls-remote origin` | Tests communication with the GitHub remote and retrieves its references. |

### SYNVORA GitHub remote

```text
git@github.com:bibiayo6370-cyber/synvora-ai-competence-lab.git
```

### SSH security rule

Never share or upload:

```text
~/.ssh/id_ed25519
```

The public key is:

```text
~/.ssh/id_ed25519.pub
```

Only the public key should be added to GitHub.

## 6. Docker

| Command | Description |
|---|---|
| `docker --version` | Displays the Docker version. |
| `docker compose version` | Displays the Docker Compose version. |

Docker Desktop runs on Windows and is integrated with Ubuntu WSL2. PostgreSQL for SYNVORA is intended to run as a Docker container rather than as a separate Windows PostgreSQL installation.

### Current environment

- Docker: `29.7.2`
- Docker Compose: `v5.5.0`

## 7. Project Initialization

The SYNVORA repository is located at:

```text
C:\Users\jtd\Documents\Projects\synvora-ai-competence-lab
```

From Ubuntu:

```bash
cd ~/projects
mkdir synvora-ai-competence-lab
cd synvora-ai-competence-lab
git init
git branch -m main
```

## 8. Troubleshooting Notes

### Git `chmod ... Operation not permitted` on `/mnt/c`

When Git initialization initially failed with:

```text
chmod on .../.git/config.lock failed: Operation not permitted
```

the WSL Windows-drive mount did not have Linux metadata enabled.

The fix was to edit:

```text
/etc/wsl.conf
```

and add:

```ini
[automount]
options = "metadata"
```

Then WSL was shut down from Windows with:

```powershell
wsl --shutdown
```

After restarting Ubuntu, Git initialization worked correctly.

### Docker unavailable inside Ubuntu

If Ubuntu reports:

```text
The command 'docker' could not be found in this WSL 2 distro.
```

do not install Docker separately inside Ubuntu when using Docker Desktop.

Enable:

**Docker Desktop → Settings → Resources → WSL Integration → Ubuntu**

Then restart/apply the Docker Desktop configuration and verify:

```bash
docker --version
docker compose version
```

## 9. Frequently Used SYNVORA Commands

### Enter the project

```bash
cd ~/projects/synvora-ai-competence-lab
```

### Check repository state

```bash
git status
```

### Check current branch

```bash
git branch --show-current
```

### Check GitHub connection

```bash
git remote -v
git ls-remote origin
```

### Stage and commit work

```bash
git add .
git commit -m "Describe the change"
```

### Synchronize with GitHub

```bash
git pull
git push
```

---

## 10. Commands to Add Later

This document is intentionally a **living reference**. As SYNVORA development progresses, add commands under appropriate sections for:

- pnpm workspaces
- React/Vite development
- Node/Express development
- PostgreSQL
- Docker Compose services
- Database migrations
- Testing with Vitest
- React Testing Library
- Supertest
- Playwright
- TypeScript
- Codex CLI
- Git branching and release workflows
- Debugging and troubleshooting

---

## Project Environment Principles

1. **Windows is the host development filesystem.**
2. **Ubuntu WSL2 is the preferred Linux terminal.**
3. **Kali Linux is not part of the SYNVORA development workflow.**
4. **Node.js runs natively in Ubuntu WSL2 through NVM; avoid the obsolete `node.exe` alias.**
5. **Docker Desktop provides the container runtime.**
6. **PostgreSQL is intended to run in Docker.**
7. **GitHub is the source-control and repository system.**
8. **SSH is used for GitHub authentication.**
9. **The command reference is maintained as a living project document.**
10. **Avoid installing development tools unless the project actually requires them.**

## 11. Shared Contracts Development (2026-10-08)

### Verify native WSL toolchain

```bash
type -a node
type -a pnpm
node --version
pnpm --version
```

Node.js `v24.21.0` is managed through NVM in Ubuntu. Remove any previous `alias node="node.exe"` from `~/.bashrc`. The project root declares `"packageManager": "pnpm@12.10.1"`; pnpm may select that version inside the repository even if a different version is installed globally.

### Check pnpm store and filesystem

```bash
pnpm store path
pwd -P
pnpm config get store-dir
```

The project resolves physically under `/mnt/c/Users/jtd/Documents/Projects/synvora-ai-competence-lab`. pnpm automatically selected `/mnt/c/.pnpm-store/v11`, avoiding cross-filesystem hard-link problems. No explicit store configuration was needed.

### Install shared package dependencies (reference only)

```bash
pnpm --filter @synvora/shared add zod
pnpm --filter @synvora/shared add -D typescript
pnpm --filter @synvora/shared add -D vitest
```

These packages are already installed. Do not reinstall them without a reason. The shared package uses Zod for runtime validation, TypeScript for types, and Vitest for automated tests.

### Validate the shared health contract

```bash
pnpm --filter @synvora/shared run check
pnpm --filter @synvora/shared run test
```

The first test suite passed four cases: valid response accepted; invalid status, empty service name, and invalid timestamp rejected. Cross-package consumption is not yet validated.

### Git hygiene and staged validation

```bash
git status --short --untracked-files=all
git diff --check
git add <specific-paths>
git diff --cached --check
git diff --cached --stat
```

Track `pnpm-lock.yaml`; ignore `node_modules/` using `.gitignore`. The unstaged diff check does not cover untracked files, so validate newly created files after staging.

### AI engineering evidence

Record significant ChatGPT/Codex contributions, human decisions, corrections, validation, and Git references in `docs/AI-ENGINEERING/AI_ENGINEERING_LOG.md`. Do not claim tools were used unless supported by actual work.

## 12. API HTTP Integration Testing (2026-10-10)

### Dependency installation (reference only)

```bash
pnpm --filter @synvora/api add -D vitest@^5.0.3 supertest @types/supertest @types/node@^24
```

Installed API development dependencies: Vitest 5.0.3, Supertest 7.3.1,
@types/supertest 7.2.1, and @types/node 24.19.1. The direct Node types now
match the Node 24 runtime; transitive dependencies still include Node 26 types.

### Validate shared and API packages

Run from the repository root:

```bash
pnpm --filter @synvora/shared run check
pnpm --filter @synvora/shared run build
pnpm --filter @synvora/shared run test
pnpm --filter @synvora/api run check
pnpm --filter @synvora/api run build
pnpm --filter @synvora/api run test
git diff --check
git status --short
git diff
```

The API test script explicitly builds shared before running Vitest, so it uses
the current compiled shared exports even when shared has not previously been
built. Build shared before running the standalone API check or build commands.
No root orchestration or dedicated Vitest configuration is required; Vitest's
default Node environment and test discovery cover `src/app.test.ts`.

The API check uses `tsconfig.test.json` to check both production and test source
without emitting files. The production build retains `tsconfig.json`, which
excludes tests. Relative source imports use `.js`; shared imports use
`@synvora/shared`.

HTTP tests verify health status 200, JSON content type, service identity, shared
schema validation, and an unsupported route's 404 status. Importing `app` does
not execute `server.ts`; Supertest manages temporary localhost listeners.
Restricted environments must permit local socket binding to run these tests.

### Assignment 001 validation evidence

Shared check/build and API check/build passed. Shared tests passed all four
cases. The first API test run was blocked by sandbox `listen EPERM` on
127.0.0.1; the same command passed both HTTP tests when rerun with approved
listener permission. `git diff --check` passed.
Human review is pending; no Git checkpoint has been created.

### Independent human verification — 2026-10-10

The implementation was independently validated in the WSL development
environment after Codex completed Assignment 001.

All shared and API checks and builds passed. All six automated tests passed:
four shared schema tests and two API HTTP integration tests.

The independent API test execution completed without the earlier sandbox
localhost listener restriction.

See docs/AI-ENGINEERING/AI_ENGINEERING_LOG.md for the human review decision.

## 13. Assignment 002A — PostgreSQL, migrations, and verification

### Local environment setup

Use native WSL Node 24 and Docker Desktop with Ubuntu WSL integration enabled.
Compose uses PostgreSQL `17.6-bookworm`, development port `55432`, test port
`55433`, and distinct persistent volumes under Compose project `synvora-002a`.
The databases are initialized as `synvora_dev` and `synvora_test` on fresh volumes.
Existing volumes/data must be preserved. Do not use `down -v`, database drops,
truncate, or volume deletion without explicit approval.

Create ignored local files from `.env.example` in `infrastructure/docker/` and
`apps/api/`. Generate different local passwords, update the matching connection
URLs, and do not print, commit, or place credentials on command lines. The API
requires localhost URLs naming the dedicated database. Do not overwrite existing
`.env` files. Node scripts load `.env` through native `--env-file`.

```bash
# Read-only inventory of this project's resources
docker volume ls --filter label=com.docker.compose.project=synvora-002a
docker ps -a --filter label=com.docker.compose.project=synvora-002a

# Creates missing services/volumes; preserves existing data
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.yaml up -d --wait

# Verify real database names, not just pg_isready
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.yaml exec -T postgres-dev psql -U synvora -d synvora_dev -c 'SELECT current_database();'
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.yaml exec -T postgres-test psql -U synvora -d synvora_test -c 'SELECT current_database();'

pnpm install --frozen-lockfile
pnpm --filter @synvora/shared run check
pnpm --filter @synvora/shared run build
pnpm --filter @synvora/shared run test
pnpm --filter @synvora/api run check
pnpm --filter @synvora/api run build

# Explicit schema modification: approve before agent execution
pnpm --filter @synvora/api run db:migrate dev
pnpm --filter @synvora/api run db:migrate test
# Repeat both commands to verify zero pending migrations

pnpm --filter @synvora/api run test
# Writes/deletes only newly generated schemas in synvora_test; never resets public
pnpm --filter @synvora/api run test:db
# Explicit approval: creates and deletes only one new development smoke attempt
pnpm --filter @synvora/api run test:restart
pnpm --filter @synvora/api run start

git diff --check
git status --short --untracked-files=all
git diff
```

API startup verifies applied migration checksums and refuses missing/outdated schema.
Keep `apps/api/migrations/` with compiled runtime assets; do not commit `dist/`.
The pnpm lockfile contains multiple YAML documents, including package-manager and
workspace dependency sections. Preserve the entire file. Unit tests use test-only
repository doubles; production and integration tests use PostgreSQL.

### Daily retention cleanup — documented, not configured

```bash
pnpm --filter @synvora/api run db:cleanup
```

This command physically deletes expired development attempts and their children.
Agent execution requires approval before deletion. API access expires after exactly
168 hours even if cleanup never runs. Activity does not extend expiration.

For a reproducible daily schedule, first independently review cleanup, build the
API, and verify the command manually. Run `crontab -e` and add a line using your
actual absolute project and Node paths, for example:

```cron
0 2 * * * cd /home/jtd/projects/synvora-ai-competence-lab/apps/api && /home/jtd/.nvm/versions/node/v24.21.0/bin/node --env-file=.env dist/db/cleanup.js >> /home/jtd/synvora-cleanup.log 2>&1
```

The time is 02:00 in the cron host's configured timezone; configure/verify that
host timezone explicitly rather than assuming it matches Africa/Lagos. Check the
installed entry with `crontab -l`, ensure the cron daemon, WSL, and Docker are
running, and inspect the credential-free count/error log after a scheduled run.
A sleeping/stopped WSL distro does not provide dependable scheduling. Production
scheduling/backups require a later operational decision. This assignment does not
install a cron entry and does not claim scheduled deletion is operational.

### API behavior

Create with `{ "challengeId": "001", "challengeVersion": "0.1" }` at
`POST /api/attempts`; retain the returned secret without displaying/logging it.
Send it only in `Authorization: Bearer ...` for attempt reads/writes. Protected
responses use no-store. Missing/malformed secrets return 401; wrong-secret,
unknown, and expired attempts return the same 404.

Prediction/reveal/investigation/modification/validation/reflection routes implement
server-authoritative progression. Invalid request shape is 400, stage conflict 409,
rejected expression 422, and safe-but-failing validation 200. Reflection can complete
a failing technical attempt after safe evaluation. Current draft must match the
latest evaluated validation. Investigation/reflection/AI declaration are unassessed.
Only public example feedback and aggregate fixture counts are returned. No report
endpoint, automated SOLO inference, or mastery scoring is implemented by the API.

## Assignment 002B — learner web application

Run from repository root with approved frontend dependencies:

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
pnpm --filter @synvora/web run test
```

Web dev/build/test build shared exports first. Web check includes application tests
and Vite/Vitest configurations. Root build includes shared, API and web. Backend
and shared dependency versions remain unchanged.

Start in two terminals with the existing configured development database:

```bash
pnpm --filter @synvora/api run dev
```

```bash
pnpm run dev:web
```

Visit http://127.0.0.1:5173. Vite proxies `/api` to localhost:8000 without path
rewrites. For built assets, run `pnpm --filter @synvora/web run preview` and visit
http://127.0.0.1:4173 with the API still running. Frontend servers bind to localhost
and fail if their fixed port is occupied. No backend CORS changes are required.
Existing database setup remains separate; these commands do not run migrations.

### Human browser smoke (pending until actually executed)

1. Read the session notice. Start, submit a prediction and confirm it locks.
   No reference output appears until Reveal reference result.
2. Reveal and continue to investigation. Explain arguments and save. Save `total`
   as the expression. Validate `total/0`: verify rejection feedback, focused input,
   preserved text and retry without advancement.
3. Validate `total`: safe evaluation with failing checks permits reflection.
   Enter reflection and optional AI note; Edit/revalidate and return, confirming
   those unsaved drafts remain intact.
4. Reject `total/0` again at reflect: reflection continuation disappears. Revalidate
   `total`, return and complete. Confirm evidence-only completion and report deferral.
5. Refresh at Run, Investigate, Validate, Reflect and Completion. Persisted state
   resumes without unlocking prediction or hiding revealed reference. Change a
   submitted expression without submitting, refresh, and confirm only the saved
   draft returns; the notice must have warned that unsubmitted edits can be lost.
6. Toggle browser Network Offline while submitting. Verify session/draft preservation,
   restore network and Check saved progress before retry. Do not export request headers.
7. Remove only `synvora.attempt.v1` in browser Storage and refresh: no recovery is
   promised. For inaccessible-session testing, change only its attempt ID to an
   unused valid UUID and refresh: the scoped entry clears, unrelated data remains,
   and Start again is offered. Never copy/log the secret.
8. To provoke the actual server's 409 without backend changes: while at Reflect with
   typed reflection, use browser Network edit/resend on an earlier modification PUT
   to save `total + 0` as the draft. Retain authorization internally; do not export
   headers. Submit reflection from the stale UI. Confirm REVALIDATION_REQUIRED,
   preserved reflection and expression feedback; revalidate and complete. This is
   test-only conflict injection, not an ordinary learner step.
9. Check 320 px/mobile and desktop widths, keyboard navigation, labels, visible
   focus, error announcements and internal code scrolling without page overflow.

Record browser/version, date, actual steps/results and failures in the verification
record. jsdom tests do not establish browser smoke. Database resets, credential
exports and public deployment are excluded. Browser automation belongs to 002C.

### Mounted-drive test limitation

On this workspace's /mnt/c mount, jsdom cold import exceeded Vitest's fixed worker
startup timeout. Frontend tests passed on a byte-identical native Linux copy under
/tmp/synvora-002b-verify. Keep WSL checkouts on native Linux storage for dependable
test startup; the /home project path here is a symlink to the Windows mount.
No toolchain source was patched. Native-copy verification commands/results are
recorded in ASSIGNMENT_002B_VERIFICATION.md; ordinary mounted-drive pnpm frontend
test runs did not pass. This does not replace the pending human browser smoke.

## Assignment 002C Phase A — shared report contracts

Phase A adds contracts and review documents only. It does not add a report route,
backend builder, frontend view, database migration, or dependency. From repository
root, ordinary shared verification remains:

```bash
pnpm --filter @synvora/shared run test
pnpm --filter @synvora/shared run check
pnpm --filter @synvora/shared run build
git diff --check
git status --short --branch
```

When avoiding pnpm's automatic pre-run dependency verification, use the already
installed local tools directly from `packages/shared` (no installation):

```bash
node ./node_modules/vitest/vitest.mjs run --reporter=verbose
node ./node_modules/typescript/bin/tsc --noEmit -p tsconfig.test.json
node ./node_modules/typescript/bin/tsc -p tsconfig.json
```

These direct commands exercise the shared test/check/build scripts' underlying
tools. Shared output is ignored compiled ESM; do not stage `dist`. Phase A shared
tests run in the repository, not the earlier frontend native-copy workaround.

Human 002C refinement supersedes the earlier browser-automation expectation for
this capstone: Playwright is deferred; real-backend human browser acceptance and
an actual demonstration are required in later authorized phases. The seven-section
visual report remains mandatory. Phase A cannot establish browser/report acceptance.

## Assignment 002C Phase B — backend report verification

The API provides `GET /api/attempts/:id/report` for completed, unexpired attempts
using the existing bearer header. It returns shared `competenceReportSchema` and
`Cache-Control: no-store`. Incomplete authorized attempts return 409 REPORT_NOT_READY;
malformed requests 400, malformed/missing bearer 401, unknown/wrong-secret/expired
attempts 404, and internal evidence/output failures sanitized 500. No credential
belongs in a URL, command history, copied headers, or verification log.

Build shared first with the commands above. From `apps/api`, direct installed-tool
commands avoid installation or pnpm pre-run dependency verification:

```bash
node ./node_modules/typescript/bin/tsc --noEmit -p tsconfig.test.json
node ./node_modules/typescript/bin/tsc -p tsconfig.json
node ./node_modules/vitest/vitest.mjs run
SYNVORA_DB_TESTS=1 node --env-file=.env ./node_modules/vitest/vitest.mjs run
```

HTTP tests require localhost socket permission. Database tests require both existing
dedicated databases and ignored `.env`; they create new random schemas only in
synvora_test, apply the existing migration inside those schemas, and remove their
own schemas in cleanup. They verify development data is unchanged. Do not reset
databases, apply migrations to public schemas, or print environment values.
No new migration or dependency is introduced by reporting. Results and any initial
failures are recorded in ASSIGNMENT_002C_VERIFICATION.md. Phase B does not implement
the visual report or establish human browser acceptance; stop before Phase C.

## Assignment 002C Phase C — visual report and browser acceptance

From apps/web, use existing installed tools without installing anything:

```bash
node ./node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node ./node_modules/typescript/bin/tsc --noEmit -p tsconfig.node.json
node ./node_modules/vite/bin/vite.js build
node ./node_modules/vitest/vitest.mjs run
```

Mounted Vitest again failed worker startup before executing tests. The established
/tmp/synvora-002b-verify copy was reused: synchronize apps/web source/config and
current compiled packages/shared exports, preserve installed dependencies, exclude
node_modules/dist from web source comparison and exclude all environment files.
Run the same Vitest command from the native apps/web directory and verify source/
configuration/shared-output equality against the repository. Do not install, patch
Vitest, change timeouts, or claim that native results prove mounted-worker startup.
Exact results and the corrected StrictMode response fixture are in the verification record.

### Real-backend human checklist — Phase D accepted; reproduction steps

The human reviewer accepted all seven Phase D scenarios. The steps below remain
reproduction guidance; their eight items are not a renumbering of the seven human
scenarios. Specific confirmations and evidence limitations are recorded in
ASSIGNMENT_002C_VERIFICATION.md: Test 3 conflict/recovery, Test 4 report-only
failure/recovery with an explicit **Retry report** click, Test 5 session loss after
full credential removal, Test 6 literal HTML-like text, and Test 7 basic mobile/
keyboard checks. The later header correction passed at 320px, 375px and 768px
with keyboard smoke verification. These are human observations, not Playwright
results or exhaustive accessibility/security certification.

Use the existing configured PostgreSQL and current shared/API builds. Start API and
web with the README commands; browse http://127.0.0.1:5173 with API on port 8000.
Do not run new migrations, reset containers/databases, or export bearer headers.

1. Complete Challenge 001 with a passing expression. Confirm automatic report
   loading, all seven titled sections, genuine check counts, pending qualitative/
   SOLO assessment, limitations, evidence links, and server next-step wording.
2. In a fresh anonymous session, safely validate a failing expression such as
   `total`, then complete reflection. Confirm the report shows the actual server
   counts and technical gaps, and guidance refers to further practice/new attempts.
   The completed attempt must offer no expression/reflection mutation controls.
3. Repeat rejection/correction (`total/0` then a permitted safe expression) and the
   existing section's REVALIDATION_REQUIRED conflict procedure before completion.
   Confirm preserved drafts, correct latest evidence, and eventual report display.
4. For a report-only outage, block only `*/api/attempts/*/report` using browser
   request blocking before completion; keep the other API requests online. Confirm
   submitted completion evidence remains visible. Unblock and click Retry report.
   Inspect request methods/counts without exporting headers: only GET repeats,
   never reflection/validation/creation. This is deliberate network-failure injection.
5. Refresh a completed attempt. Confirm protected state/report retrieval, preserved
   submitted evidence, and truthful restored-progress wording. Inspect key names
   only: synvora.attempt.v1 contains just attemptId/secret, no persisted report/evidence.
6. Remove only the scoped session entry and refresh: return to Challenge without
   protected recovery. Wrong/inaccessible credentials should clear only that entry.
   Report 401/404 handling preserves already loaded completion text for copying.
   Actual expiry browser verification requires an already expired authorized fixture;
   otherwise record it pending. Do not change browser time and claim server expiry.
7. In a dedicated test attempt, submit HTML-like reflection text, such as
   `<b>untrusted reflection</b>`. Confirm literal text, no interpreted markup. If an
   AI declaration is supplied, it must be labeled unverified; absence proves no use status.
8. Navigate sections and evidence links by keyboard, check focus and feedback,
   readable desktop presentation, and 320–375 px layouts without page overflow.
   Inconclusive/missing evidence has automated coverage; a browser check requires
   an existing approved fixture. Do not tamper with completed data to manufacture one.

Record browser/version, date/timezone, scenario observations, screenshots without
credentials, and failures. Distinguish real server checks from deliberate injection
and unavailable fixtures. Earlier 002B human results are historical evidence, not
Phase C report acceptance. Current Phase D acceptance is separately human-confirmed;
no additional browser execution or recorded demonstration is claimed by this
documentation reconciliation.
