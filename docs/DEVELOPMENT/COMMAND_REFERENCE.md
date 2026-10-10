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
